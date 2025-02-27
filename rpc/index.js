/**
 * Tencent is pleased to support the open source community by making Tars available.
 *
 * Copyright (C) 2016THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the BSD 3-Clause License (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * https://opensource.org/licenses/BSD-3-Clause
 *
 * Unless required by applicable law or agreed to in writing, software distributed
 * under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

const client = require("@tars/rpc/protal.js").client;

const AdminRegProxy = require("./proxy/AdminRegProxy");
const ConfigFProxy = require("./proxy/ConfigFProxy");
const DCacheOptProxy = require("./proxy/DCacheOptProxy");
const MonitorQueryProxy = require("./proxy/MonitorQueryProxy");
const PatchProxy = require("./proxy/PatchProxy");
const TopologyProxy = require("./topology/TopologyProxy");
const WebConf = require("../config/webConf");
const BenchmarkAdminProxy = require("./proxy/BenchmarkAdminProxy");
const BenchmarkNode = require("./proxy/BenchmarkNodeTars");

const {
    RPCClientPrx
} = require('./service');

client.initialize(WebConf.client);

//生成rpc结构体
const RPCStruct = function(proxy, moduleName){
    var module = proxy[moduleName];
    var rpcStruct = {};
    for(var p in module){
        if(module.hasOwnProperty(p)){
            if(typeof module[p] == 'function'){
                if(new module[p]()._classname){
                    rpcStruct[p] = module[p];
                }
            }else{
                rpcStruct[p] = module[p];
            }
        }
    }
    return rpcStruct;
};

module.exports = {
    // RPCClientPrx,

    patchPrx: RPCClientPrx(client, PatchProxy, 'tars', 'Patch', 'tars.tarspatch.PatchObj'),

    adminRegPrx: RPCClientPrx(client, AdminRegProxy, 'tars', 'AdminReg', 'tars.tarsAdminRegistry.AdminRegObj'),

    configFPrx: RPCClientPrx(client, ConfigFProxy, 'tars', 'Config', 'tars.tarsconfig.ConfigObj'),

    statQueryPrx: RPCClientPrx(client, MonitorQueryProxy, 'tars', 'MonitorQuery', 'tars.tarsquerystat.QueryObj'),
    propertyQueryPrx: RPCClientPrx(client, MonitorQueryProxy, 'tars', 'MonitorQuery', 'tars.tarsqueryproperty.QueryObj'),

    DCacheOptPrx: RPCClientPrx(client, DCacheOptProxy, 'DCache', 'DCacheOpt', 'DCache.DCacheOptServer.DCacheOptObj'),

    topologyPrx: RPCClientPrx(client, TopologyProxy, 'tars', 'Topology', 'tars.tarslog.TopologyObj'),

    client: client,

    benchmarkPrx : RPCClientPrx(client,BenchmarkAdminProxy, 'bm', 'Admin', 'benchmark.AdminServer.AdminObj'),
    benchmarkStruct : RPCStruct(BenchmarkAdminProxy, 'bm'),
    benchmarkNodeStruct : RPCStruct(BenchmarkNode, 'bm')

};
