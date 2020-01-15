<template>
  <div class="pm-doc-hd">
    <div class="filter-container">
      <el-date-picker
        class="filter-item"
        v-model="listQuery.createTime"
        style="width: 150px;"
        type="date"
        placeholder="开始时间"
      ></el-date-picker>
      <el-date-picker
        class="filter-item"
        v-model="listQuery.finishTime"
        style="width: 150px;"
        type="date"
        placeholder="结束时间"
      ></el-date-picker>
      <el-input
        @keyup.enter.native="handleSearch"
        style="width: 200px;"
        class="filter-item"
        placeholder="需求名称"
        v-model="listQuery.name"
      ></el-input>
      <el-button class="filter-item filter-button" icon="el-icon-search" @click="handleSearch"
        >搜索</el-button
      >
      <el-button
        class="filter-item filter-button"
        style="margin-left: 10px;"
        @click="handleCreate"
        icon="el-icon-plus"
        >增加</el-button
      >
    </div>
    <el-divider />
    <div class="doc-card-list">
      <el-timeline v-if="cardList.length > 0">
        <el-timeline-item
          v-for="(value, key) in timeLineCard"
          :timestamp="key"
          :key="key"
          placement="top"
        >
          <el-card class="box-card" v-for="(item, index) in value" :key="index">
            <div slot="header" class="card-head clearfix">
              <div class="card-title">
                <span class="card-name">{{ item.name }}</span>
                <el-button
                  class="card-button"
                  type="text"
                  icon="el-icon-delete"
                  @click="handleDelete(item)"
                ></el-button>
                <el-button
                  class="card-button"
                  type="text"
                  icon="el-icon-edit"
                  @click="handleEdit(item)"
                ></el-button>
                <el-button
                  class="card-button"
                  type="text"
                  icon="el-icon-view"
                  @click="handleView(item)"
                ></el-button>
              </div>
              <div class="card-des-time">
                <p class="card-des">{{ item.des }}</p>
                <p class="card-time">
                  <a v-for="(v, k) in item.url" :key="k" target="_blank" :href="v.url">{{
                    v.urlItems
                  }}</a>
                  <i class="el-icon-timer">{{ item.createTime | parseTime('{y}-{m}-{d}') }}</i>
                </p>
              </div>
            </div>
            <div class="url-items">
              备注：
              <span>{{ item.remarks || '暂无备注' }}</span>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <div v-else class="empty-wrapper">
        <img class="empty-img" :src="emptyImg" />
        <div class="empty-txt">哟嚯，暂无需求文档</div>
      </div>
    </div>

    <el-dialog
      :title="textMap[dialogStatus]"
      custom-class="doc-dialog"
      :visible.sync="dialogDocVisible"
      width="800px"
    >
      <el-form
        size="medium"
        class="config-form"
        ref="templateForm"
        :model="pmdocTemp"
        label-width="100px"
        :rules="rules"
      >
        <el-form-item v-if="dialogStatus === 'view'" label="创建时间：" prop="createTime">
          <p>{{ pmdocTemp.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</p>
        </el-form-item>
        <el-form-item label="需求名称：" prop="name">
          <el-input
            v-if="dialogStatus !== 'view'"
            :disabled="dialogStatus === 'update'"
            v-model="pmdocTemp.name"
          ></el-input>
          <p v-else>{{ pmdocTemp.name }}</p>
        </el-form-item>
        <el-form-item label="需求描述：" prop="des">
          <el-input v-if="dialogStatus !== 'view'" v-model="pmdocTemp.des"></el-input>
          <p v-else>{{ pmdocTemp.des }}</p>
        </el-form-item>
        <el-form-item
          v-for="(item, index) in pmdocTemp.url"
          :key="index"
          :label="index === 0 ? '相关url：' : ''"
        >
          <el-col :span="4">
            <el-form-item label :prop="`url[${index}].urlItems`" :rules="rules.urlItems">
              <el-input
                v-if="dialogStatus !== 'view'"
                :disabled="item.urlItems === 'prd'"
                v-model="item.urlItems"
              ></el-input>
              <p v-else>{{ item.urlItems }}</p>
            </el-form-item>
          </el-col>
          <el-col :span="1">&nbsp;:</el-col>
          <el-col :span="16">
            <el-form-item label :prop="`url[${index}].url`" :rules="rules.url">
              <el-input v-if="dialogStatus !== 'view'" v-model="item.url" placeholder></el-input>
              <a :href="item.url" target="_blank" v-else>{{ item.url }}</a>
            </el-form-item>
          </el-col>
          <el-col :span="3" v-if="dialogStatus !== 'view'">
            <el-form-item>
              <i class="url-icon el-icon-circle-plus-outline" @click="handleAddUrl(index)"></i>
              <i
                v-if="item.urlItems !== 'prd'"
                class="url-icon el-icon-remove-outline"
                @click="handleDeleteUrl(index)"
              ></i>
            </el-form-item>
          </el-col>
        </el-form-item>
        <el-form-item label="备注：">
          <el-input
            v-if="dialogStatus !== 'view'"
            type="textarea"
            v-model="pmdocTemp.remarks"
          ></el-input>
          <p v-else>{{ pmdocTemp.remarks }}</p>
        </el-form-item>
        <el-form-item v-if="dialogStatus !== 'view'">
          <el-button type="primary" @click="handleSubmit">确定</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { getProjectPmDoc, createProjectPmDoc, updateProjectPmDoc, deleteProjectPmDoc } from './api';
import { isUrl } from '@/utils';

const emptyImg = require('@/assets/imgs/empty.png');
const defaultPmdoc = {
  name: '',
  des: '',
  url: [
    {
      urlItems: 'prd',
      url: ''
    },
    {
      urlItems: 'ui',
      url: ''
    },
    {
      urlItems: 'api',
      url: ''
    }
  ],
  remarks: ''
};

export default {
  data() {
    const checkUrl = (rule, value, callback) => {
      if (!isUrl(value)) {
        callback(new Error('url格式不正确！'));
      } else {
        callback();
      }
    };

    return {
      emptyImg,
      listQuery: {
        createTime: '',
        finishTime: '',
        name: ''
      },
      dialogDocVisible: false,
      pmDocList: [],
      cardList: [],
      timeLineCard: {},
      pmdocTemp: JSON.parse(JSON.stringify(defaultPmdoc)),
      rules: {
        name: [{ required: true, message: '需求名称为必填项', trigger: '' }],
        des: [{ required: true, message: '需求描述为必填项', trigger: '' }],
        url: [{ validator: checkUrl, message: 'url格式不正确', trigger: '' }],
        urlItems: [{ required: true, message: 'url为必填项', trigger: '' }]
      },
      textMap: {
        update: '编辑文档',
        create: '创建文档',
        view: '查看文档'
      },
      dialogStatus: ''
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    async getList() {
      try {
        const { id } = this.$route.params;
        const { readmes = [] } = await getProjectPmDoc({ id });
        const list = readmes
          .map(item => {
            const pmContent = item.content;
            const pmObj = {};
            pmObj.name = pmContent[1].content;
            pmObj.des = pmContent[3].content;
            pmObj.createTime = item.shortPath.slice(1, 14);
            pmObj.path = item.absPath;
            pmObj.year = new Date(+pmObj.createTime).getFullYear();
            pmObj.month = new Date(+pmObj.createTime).getMonth() + 1;
            if (pmObj.month > 0 && pmObj.month < 10) {
              pmObj.month = '0' + pmObj.month;
            }
            if (pmContent[5] && pmContent[5].block === 'paragraph') {
              pmObj.remarks = pmContent[5].content;
              pmObj.url = this.processObj(pmContent[7].content);
            } else {
              pmObj.url = this.processObj(pmContent[5].content);
            }
            return pmObj;
          })
          .sort((a, b) => {
            return b.createTime - a.createTime;
          });
        this.pmDocList = [...list];
        this.cardList = [...list];
        this.processTimeLine();
      } catch (e) {
        this.$message.error(e.message || e);
      }
    },
    handleSearch() {
      const createTime = +new Date(this.listQuery.createTime) || 0;
      let finishTime = +new Date(this.listQuery.finishTime) || Infinity;
      finishTime = finishTime === Infinity ? finishTime : finishTime + 1000 * 60 * 60 * 24;
      const name = this.listQuery.name;
      this.cardList = this.pmDocList.filter(item => {
        return (
          item.createTime > createTime &&
          item.createTime < finishTime &&
          item.name.indexOf(name) > -1
        );
      });
      this.processTimeLine();
    },
    handleCreate() {
      this.resetPmDoc();
      this.dialogStatus = 'create';
      this.dialogDocVisible = true;
      this.$nextTick(() => {
        this.$refs['templateForm'].clearValidate();
      });
    },
    resetPmDoc() {
      this.pmdocTemp = JSON.parse(JSON.stringify(defaultPmdoc));
    },
    handleAddUrl(index) {
      this.pmdocTemp.url.splice(index + 1, 0, { urlItems: '', url: '' });
    },
    handleDeleteUrl(index) {
      this.pmdocTemp.url.splice(index, 1);
    },
    handleSubmit() {
      this.$refs['templateForm'].validate(async valid => {
        if (valid) {
          try {
            if (this.dialogStatus === 'create') {
              await createProjectPmDoc({
                data: { ...this.pmdocTemp },
                id: this.$route.params.id
              });
              await this.getList();
              this.$message.success('创建成功');
            } else {
              await updateProjectPmDoc({
                data: { ...this.pmdocTemp },
                id: this.$route.params.id
              });
              this.pmDocList = this.pmDocList.map(item => {
                if (item.createTime === this.pmdocTemp.createTime) {
                  item = Object.assign(item, this.pmdocTemp);
                }
                return item;
              });
              this.cardList = this.cardList.map(item => {
                if (item.createTime === this.pmdocTemp.createTime) {
                  item = Object.assign(item, this.pmdocTemp);
                }
                return item;
              });
              this.$message.success('更新成功');
            }
            this.dialogDocVisible = false;
            this.processTimeLine();
          } catch (e) {
            this.$message.error(e.message || e);
          }
        }
      });
    },
    handleCancel() {
      this.dialogDocVisible = false;
    },
    async handleDelete(item) {
      try {
        await this.$confirm(`确认删除这个需求卡片?`, '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });

        await deleteProjectPmDoc({ path: item.path });
        this.pmDocList.forEach((value, index) => {
          if (item.createTime === value.createTime) {
            this.pmDocList.splice(index, 1);
          }
        });
        this.cardList.forEach((value, index) => {
          if (item.createTime === value.createTime) {
            this.cardList.splice(index, 1);
          }
        });
        this.processTimeLine();
      } catch (e) {
        if (e !== 'cancel') {
          this.$message.error(e.message || e);
        }
      }
    },
    handleEdit(item) {
      this.pmdocTemp = JSON.parse(JSON.stringify(item));
      this.dialogStatus = 'update';
      this.dialogDocVisible = true;
      this.$nextTick(() => {
        this.$refs['templateForm'].clearValidate();
      });
    },
    handleView(item) {
      this.pmdocTemp = JSON.parse(JSON.stringify(item));
      this.dialogStatus = 'view';
      this.dialogDocVisible = true;
      this.$nextTick(() => {
        this.$refs['templateForm'].clearValidate();
      });
    },
    processObj(obj) {
      let url = [];
      if (Array.isArray(obj)) {
        url = obj.map(value => {
          const urlcon = value.content.content;
          if (Array.isArray(urlcon)) {
            return { urlItems: urlcon[0].split(' ')[0], url: urlcon[1].href };
          } else {
            return {};
          }
        });
      } else {
        const urlcon = obj.content.content;
        if (Array.isArray(urlcon)) {
          url.push({ urlItems: urlcon[0].split(' ')[0], url: urlcon[1].href });
        } else {
          url.push({});
        }
      }
      return url;
    },
    processTimeLine() {
      const timeLineCard = {};
      this.cardList.forEach((item, index) => {
        const yearMonth = `${item.year}-${item.month}`;
        if (!timeLineCard[yearMonth]) {
          timeLineCard[yearMonth] = [];
        }
        timeLineCard[yearMonth].push(item);
      });
      this.timeLineCard = timeLineCard;
    }
  }
};
</script>

<style lang="less" scoped>
.pm-doc-hd {
  .filter-container {
    padding: 0;
    padding-left: 20px;
  }
  .filter-item {
    height: 34px;
    line-height: 34px;
  }
  /deep/ .el-timeline-item {
    overflow: hidden;
  }
  /deep/ .el-input__inner {
    height: 34px;
    line-height: 34px;
  }

  /deep/ .el-input__icon {
    line-height: 34px;
  }
  .filter-button {
    width: 140px;
    height: 34px;
    line-height: 34px;
    padding: 0;
  }
  .doc-card-list {
    padding: 0 25px;
    overflow: hidden;
    .box-card {
      width: 300px;
      float: left;
      margin: 25px;
      transition: all 0.3s;
      &:hover {
        transform: scale(1.05);
      }
    }
    /deep/ .el-card__header {
      padding: 10px;
    }
    /deep/ .el-card__body {
      padding: 10px;
    }
    .card-button {
      float: right;
      padding: 3px 0;
      margin-left: 5px;
      color: #5062fe;
    }
    .card-title {
      height: 22px;
      line-height: 22px;
      .card-name {
        float: left;
        width: 210px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .card-des {
      color: #99abb4;
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      height: 36px;
    }
    .card-time {
      font-size: 13px;
      color: #99abb4;
      margin-top: 5px;
      a {
        margin-right: 5px;
        color: #5062fe;
        &:hover {
          text-decoration: underline;
        }
      }
      i {
        float: right;
      }
    }
    .url-items {
      color: #333;
      font-size: 14px;
      height: 20px;
      line-height: 20px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      span {
        color: #99abb4;
        font-size: 13px;
      }
    }
  }
  /deep/ .doc-dialog {
    margin-bottom: 5vh;
    a {
      color: #5062fe;
      &:hover {
        text-decoration: underline;
      }
    }
  }
  .url-icon {
    font-size: 25px;
    margin-top: 4px;
    margin-left: 10px;
    cursor: pointer;
  }
}
</style>
