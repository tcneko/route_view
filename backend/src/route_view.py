#!/usr/bin/env python3


# author: tcneko <tcneko@outlook.com>
# start from: 2021.09
# last test environment: ubuntu 20.04
# description:


# import
import aiohttp
import asyncio
import re
import ipaddress
import time

from fastapi import FastAPI
from pydantic import BaseModel


from apscheduler.schedulers.asyncio import AsyncIOScheduler

# Variable
cache = {"ripe_lg_api_response": {}}


# function
def verify_prefix(prefix):
    try:
        prefix = ipaddress.ip_network(prefix)
        if (prefix.version == 4 and prefix.prefixlen <= 24) or (prefix.version == 6 and prefix.prefixlen <= 64):
            return True
    except:
        return False


def extract_prefix(raw_prefix_list):
    regexp_ipv4_prefix = r"(?:(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/(?:3[012]|[12][0-9]|[1-9])"
    regexp_ipv6_prefix = r"(?:(?:(?:(?:(?:[0-9a-fA-F]){1,4}):){1,4}:[^\s:](?:(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])))|(?:::(?:ffff(?::0{1,4}){0,1}:){0,1}[^\s:](?:(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])))|(?:fe80:(?::(?:(?:[0-9a-fA-F]){1,4})){0,4}%[0-9a-zA-Z]{1,})|(?::(?:(?::(?:(?:[0-9a-fA-F]){1,4})){1,7}|:))|(?:(?:(?:[0-9a-fA-F]){1,4}):(?:(?::(?:(?:[0-9a-fA-F]){1,4})){1,6}))|(?:(?:(?:(?:[0-9a-fA-F]){1,4}):){1,2}(?::(?:(?:[0-9a-fA-F]){1,4})){1,5})|(?:(?:(?:(?:[0-9a-fA-F]){1,4}):){1,3}(?::(?:(?:[0-9a-fA-F]){1,4})){1,4})|(?:(?:(?:(?:[0-9a-fA-F]){1,4}):){1,4}(?::(?:(?:[0-9a-fA-F]){1,4})){1,3})|(?:(?:(?:(?:[0-9a-fA-F]){1,4}):){1,5}(?::(?:(?:[0-9a-fA-F]){1,4})){1,2})|(?:(?:(?:(?:[0-9a-fA-F]){1,4}):){1,6}:(?:(?:[0-9a-fA-F]){1,4}))|(?:(?:(?:(?:[0-9a-fA-F]){1,4}):){1,7}:)|(?:(?:(?:(?:[0-9a-fA-F]){1,4}):){7,7}(?:(?:[0-9a-fA-F]){1,4})))/(?:12[0-8]|1[01][0-9]|[1-9][0-9]|[1-9])"
    regexp_prefix = "({}|{})".format(regexp_ipv4_prefix, regexp_ipv6_prefix)
    prefix_list = []
    for prefix_src in raw_prefix_list:
        re_out_prefix_list = re.findall(regexp_prefix, prefix_src)
        if re_out_prefix_list:
            if verify_prefix(re_out_prefix_list[0]):
                prefix_list.append(re_out_prefix_list[0])
    return prefix_list


def verify_form_route_view(prefix_list, viewpoint_asn, count_filter):
    form_error = {"prefix_list_error": False, "viewpoint_asn_error": False, "count_filter_error": False,
                  "prefix_list_error_tip": "", "viewpoint_asn_error_tip": "", "count_filter_error_tip": ""}
    json_msg = {"status": "success"}
    if len(prefix_list) <= 0:
        form_error["prefix_list_error"] = True
        form_error["prefix_list_error_tip"] = "Please enter at least one valid prefix, one per line"
        json_msg = {"status": "fail", "detail": form_error}

    if viewpoint_asn < 1 or viewpoint_asn > 4294967295:
        form_error["viewpoint_asn_error"] = True
        form_error["viewpoint_asn_error_tip"] = "Please input a valid ASN (1 ~ 4294967295)"
        json_msg = {"status": "fail", "detail": form_error}

    if count_filter < 0 or count_filter > 100:
        form_error["count_filter_error"] = True
        form_error["count_filter_error_tip"] = "Please input a valid number (0 ~ 100)"
        json_msg = {"status": "fail", "detail": form_error}

    return json_msg


async def route_view_ripe_prefix(start_delay, prefix, viewpoint_asn, count_filter):
    if prefix in cache["ripe_lg_api_response"]:
        ri_map = cache["ripe_lg_api_response"][prefix]["data"]
    else:
        await asyncio.sleep(start_delay)
        async with aiohttp.ClientSession() as session:
            async with session.get("https://stat.ripe.net/data/looking-glass/data.json?resource=" + prefix) as response:
                ri_map = await response.json()
        cache["ripe_lg_api_response"][prefix] = {
            "expiration_timestamp": int(time.time())+120,
            "data": ri_map}
    obs_asp_map = {}
    src_asn_list = []
    total_asp = 0
    for rrc in ri_map["data"]["rrcs"]:
        for peer in rrc["peers"]:
            total_asp += 1
            re_out_obs_asp_list = re.findall(
                "[0-9]+ {}".format(viewpoint_asn), peer["as_path"])
            if re_out_obs_asp_list:
                obs_asp = re_out_obs_asp_list[0]
                if obs_asp in obs_asp_map:
                    obs_asp_map[obs_asp] = obs_asp_map[obs_asp] + 1
                else:
                    obs_asp_map[obs_asp] = 1
            re_out_src_asn_list = re.findall(
                "[0-9]+$", peer["as_path"])
            if re_out_src_asn_list:
                src_asn = re_out_src_asn_list[0]
                if src_asn not in src_asn_list:
                    src_asn_list.append(src_asn)
    obs_asp_list = []
    for obs_asp in obs_asp_map.keys():
        if obs_asp_map[obs_asp] >= count_filter:
            obs_asp_list.append(
                {"obs_asp": obs_asp, "count": obs_asp_map[obs_asp]})
    return {"prefix": prefix,
            "total_asp": total_asp,
            "src_asn_list": src_asn_list,
            "obs_asp_list": sorted(obs_asp_list, key=lambda e: e.__getitem__('count'), reverse=True)}


async def route_view_ripe(prefix_list, viewpoint_asn, count_filter):
    task_list = []
    for ix in range(len(prefix_list)):
        start_delay = int(ix/25)
        prefix = prefix_list[ix]
        task_list.append(route_view_ripe_prefix(
            start_delay, prefix, viewpoint_asn, count_filter))
    try:
        route_view_out_list = await asyncio.gather(*task_list)
        json_msg = {"status": "success",
                    "route_view_out_list": route_view_out_list}
    except:
        json_msg = {"status": "fail", "reason": "internal_error"}
    return json_msg


async def clean_up_cache():
    cur_timestamp = int(time.time())
    for cache_key in cache:
        for item_key in list(cache[cache_key].keys()):
            if cache[cache_key][item_key]["expiration_timestamp"] > cur_timestamp:
                del cache[cache_key][item_key]


app = FastAPI()

scheduler = AsyncIOScheduler()


@app.on_event("startup")
async def task_notify_agent_exist():
    scheduler.add_job(clean_up_cache, 'interval', seconds=30)
    scheduler.start()


class RouteViewBody(BaseModel):
    prefix_list: list
    viewpoint_asn: int
    count_filter: int


@ app.post("/api/v1/route_view")
async def api_route_view(body: RouteViewBody):
    # Extract & preprocess the form data
    prefix_list = extract_prefix(body.prefix_list)
    viewpoint_asn = body.viewpoint_asn
    count_filter = body.count_filter
    # Verify the form data
    json_msg = verify_form_route_view(
        prefix_list, body.viewpoint_asn, body.count_filter)
    if json_msg["status"] != "success":
        json_msg = {"status": "fail", "reason": "form_error",
                    "detail": json_msg["detail"]}
        return json_msg

    # Api process
    json_msg = {"event": "task_start",
                "prefix_list": prefix_list, "viewpoint_asn": viewpoint_asn, "count_filter": count_filter}
    print(json_msg)
    json_msg = await route_view_ripe(prefix_list, viewpoint_asn, count_filter)
    if json_msg["status"] == "success":
        json_msg = {"status": "success",
                    "route_view_out_list": json_msg["route_view_out_list"]}
    else:
        json_msg = {"status": "fail", "reason": json_msg["reason"]}
    return json_msg
