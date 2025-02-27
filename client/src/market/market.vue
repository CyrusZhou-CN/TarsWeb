<template>
  <div class="page_server">
    <div class="left-view">
      <div>
        <span>
          <el-input
            size="small"
            style="width: 80%"
            :placeholder="$t('home.placeholder')"
            v-model="treeSearchKey"
            @keydown.enter.native="filterTextChange"
          >
          </el-input>
          &nbsp;
          <i
            class="iconfont el-icon-third-shuaxin"
            style="cursor: pointer; font-family: iconfont  !important;z-index: 99"
            :class="{ active: isIconPlay }"
            @click="treeSearch"
          ></i>
        </span>
        <el-table
          :data="serviceList"
          stripe
          style="width: 100%"
          :show-header="false"
          @row-click="selectService"
        >
          <el-table-column :label="$t('market.table.version')">
            <template slot-scope="props">
              <el-row :gutter="24">
                <el-col :span="4">
                  <el-avatar :size="30" :src="props.row.logo"> </el-avatar>
                </el-col>
                <el-col :span="20">
                  <span>
                    <span>{{ props.row.group + "/" + props.row.name }}</span>
                    <span class="overflow">{{
                      getDescription(props.row)
                    }}</span>
                  </span>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <div class="right-view">
      <router-view ref="childView" v-if="isRouterAlive"></router-view>
    </div>
  </div>
</template>

<script>
import moment from "moment";
export default {
  name: "Market",
  data() {
    return {
      uid: "",
      treeErrMsg: "load failed",
      treeData: null,
      treeSearchKey: "",
      isIconPlay: false,
      serviceList: [],
      group: "",
      name: "",
      version: "",
      total: 0,
      offset: 0,
      limit: 20,
      isRouterAlive: false,
      k8s: true,
    };
  },
  computed: {
    webVersion() {
      return this.$store.state.version;
    },
  },
  watch: {
    webVersion(newVal, oldVal) {
      if (newVal.version && newVal.version != oldVal.version) {
        this.checkVersion(newVal.version);
      }
    },
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      let ticket = window.localStorage.ticket;
      vm.isRouterAlive = false;

      if (!ticket) {
        vm.$loginUtil.onLogin(false);
      } else {
        vm.$loginUtil.onLogin(true);

        vm.isRouterAlive = true;

        if (vm.serviceList.length == 0) {
          vm.fetchServiceData();
        }
      }
    });
  },
  methods: {
    iconLoading() {
      const that = this;
      if (!that.isIconPlay) {
        that.isIconPlay = true;
        setTimeout(function() {
          that.isIconPlay = false;
        }, 1000);
      }
    },
    treeSearch() {
      this.iconLoading();
      this.fetchServiceData();
    },
    selectService(row, column, event) {
      this.group = row.group;
      this.name = row.name;
      this.version = row.version;

      this.$router.push(
        "/market/service/" + this.group + "/" + this.name + "/" + this.version
      );
    },
    getDescription(row) {
      if (this.$cookie.get("locale") == "cn") {
        return row.description_cn || row.description;
      }
      return row.description;
    },
    fetchServiceData() {
      this.$market
        .call("cloud-market", "getServiceBaseList", {
          req: {
            offset: this.offset,
            native: !this.k8s,
            limit: this.limit,
          },
        })
        .then((data) => {
          this.serviceList = data.rsp.services;
          this.serviceList.forEach((e) => {
            e.create_time = moment(e.create_time).format("YYYY-MM-DD HH:mm:ss");
            e.update_time = moment(e.update_time).format("YYYY-MM-DD HH:mm:ss");
            e.logo = e.prefix + e.logo + "?t=" + e.update_time;
          });

          this.total = data.rsp.total;
        })
        .catch((err) => {
          this.$message({
            message: err,
            type: "error",
          });
        });
    },
    checkVersion(version) {
      this.$market
        .call("cloud-market", "checkVersion", {
          req: {
            web: version,
          },
        })
        .then((data) => {
          if (data.info.code != 0) {
            this.$message({
              message:
                this.$cookie.get("locale") == "en"
                  ? data.info.info_en
                  : data.info.info_cn,
              type: "error",
            });
          }
        })
        .catch((err) => {
          this.$message({
            message: err,
            type: "error",
          });
        });
    },
  },

  created() {},
  mounted() {
    this.k8s = location.pathname == "/k8s.html";
  },
};
</script>

<style lang="postcss">
@import "../assets/css/variable.css";

.el-icon-third-shuaxin.active {
  animation: icon_loading 1s;
}

@-webkit-keyframes icon_loading {
  0% {
    transform: rotateZ(0deg);
  }
  100% {
    transform: rotateZ(360deg);
  }
}

.overflow {
  padding-top: 5px;
  padding-bottom: 5px;
  text-align: left;
  font-size: 12px;
  color: #777777;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.page_server {
  padding-bottom: var(--gap-small);
  padding-top: var(--gap-big);
  display: flex;
  flex: 1;
  width: 100%;
  overflow: hidden;

  .left-view {
    display: flex;
    flex: 1;
    flex-flow: column;
    max-width: 260px;
  }

  .right-view {
    display: flex;
    flex: 1;
    flex-flow: column;
    margin-left: 40px;
    overflow: hidden;
    position: relative;
    width: "800px";
  }
}
</style>
