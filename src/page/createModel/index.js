import moment from 'moment';
/**
 * 创建模块
 */
const CreateMoudle = () => {
    const fs = require("fs");
    /**
     * 将驼峰式命名转换为下划线命名
     * @param {*} str 
     * @param {*} isUpperCase  default true
     * @returns 
     */
    const camelToUnderscore = (str, isUpperCase = true) => {
        if (!str || str.length === 0) {
            return str;
        }
        if (!isUpperCase) {
            return str
                .replace(/([a-z])([A-Z])/g, '$1_$2')  // 在小写字母后的大写字母前插入下划线
                .toLowerCase();                        // 转为全小写
        }
        return str
            .replace(/([a-z])([A-Z])/g, '$1_$2')  // 在小写字母后的大写字母前插入下划线
            .toUpperCase();                         // 转为全大写
    }

    /**
     * 将字符串转换为驼峰式命名， 默认小驼峰式命名， isUpper = true 为大驼峰式命名
     * @param {*} str 
     * @param {*} isUpper default false
     * @returns 
     */
    const toCamelCase = (str, isUpper = false) => {
        if (str.length === 0) {
            return str;
        }
        if (isUpper) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }
        return str.charAt(0).toLowerCase() + str.slice(1);
    }

    function ensureDirectoryExistence(filePath) {
        const path = require('path');
        const dirName = path.dirname(filePath);
        if (!fs.existsSync(dirName)) {
            fs.mkdirSync(dirName, { recursive: true });
        }
    }

    /**
     * 路由子项
     * @returns 
     */
    const getPublicString = (modleRouter, modleClassName, modelNameList, modelNoteList, selectedSys, oldCode) => {
        const modlePermissionUpper = camelToUnderscore(modleRouter || modelNameList[0]);
        if (!modelNameList || modelNameList.length === 0) {
            return ""
        }
        let code = ''
        for (const index in modelNameList) {
            const modelName = modelNameList[Number(index)]
            const modelNote = modelNoteList[Number(index)];
            if (modelName && oldCode && !oldCode.includes(`${modlePermissionUpper} + "/${modelName}Activity";`)) {
                code = code + `
        // ${modelNote} 路由链接：/ui/${selectedSys.label}/${toCamelCase(modleClassName)}/${modelName}Activity?icon=ic_home_${camelToUnderscore(modelName, false)}
        public static final String ${camelToUnderscore(modelName)}_ACTIVITY = ${modlePermissionUpper} + "/${modelName}Activity";`;
            }
        }
        return code
    }

    /**
     * 创建路由文件
     * @param {*} routPth 
     * @param {*} data 
     * @param {*} modleName 
     * @param {*} modleRouter 
     * @param {*} modleClassName 
     * @param {*} modlePermissionUpper 
     * @param {*} modelNameList 
     * @param {*} modelNoteList 
     * @param {*} selectedSys 
     */
    const writeRouterCode = (dbuPDAPath, modleName, modleRouter, modleClassName, modelNameList, modelNoteList, selectedSys) => {
        const routPth = dbuPDAPath + '\\lib_network\\src\\main\\java\\com\\zongteng\\lib_network\\router\\RouterPath.java'
        const modlePermissionUpper = camelToUnderscore(modleRouter);
        if (fs.existsSync(routPth)) {
            fs.readFile(routPth, 'utf8', (err, data) => {
                if (data) {
                    if (!data.includes(`public static class ${modlePermissionUpper}`)) {
                        let oldCode = data.substring(0, data.lastIndexOf('}'));
                        // 生成路由配置代码
                        let newCode = oldCode + `
    /**
     * ${modleName}
     */
    public static class ${modlePermissionUpper} {
        private static final String ${modlePermissionUpper} = "/ui/${selectedSys.label}/${toCamelCase(modleRouter)}";${getPublicString(modleRouter, modleClassName, modelNameList, modelNoteList, selectedSys, oldCode)}
    }
}`
                        fs.writeFileSync(routPth, newCode)
                    } else {
                        let oldCode = data.substring(data.indexOf(`public static class ${modlePermissionUpper} {`));
                        oldCode = oldCode.substring(0, oldCode.indexOf('}'));
                        console.log(oldCode)
                        let newCode = oldCode + `${getPublicString(modleRouter, modleClassName, modelNameList, modelNoteList, selectedSys, oldCode)}
    }`
                        data = data.replace(oldCode + '}', newCode)
                        fs.writeFileSync(routPth, data)
                    }
                }
            })
        }
    }
    /**
     * 修改strings.xml文件
     * @param {*} stringsPath 
     * @param {*} data 
     * @param {*} modelNameList 
     * @param {*} modelNoteList 
     */
    const writeStringsCode = (stringsPath, data, modelNameList, modelNoteList) => {
        if (data) {
            let oldCode = data.substring(0, data.lastIndexOf('</resources>'));
            // 生成strings.xml代码
            let newCode = ""
            for (const index in modelNameList) {
                const modelName = modelNameList[Number(index)];
                const modelNote = modelNoteList[Number(index)];
                newCode = newCode + `
    <string name="${camelToUnderscore(modelName, false)}_title">${modelNote}</string>`;
            }
            newCode = oldCode + newCode + `
</resources>`;
            if (!data.includes(`<string name="${camelToUnderscore(modelNameList[0], false)}_title">`)) {
                fs.writeFileSync(stringsPath, newCode)
            }
        }
    }

    const writeRequestBeanCode = (dbuPDAPath, modleRouter, modelClassNote, modleClassName) => {
        const requestBeanPathParent = dbuPDAPath + '\\module_common\\src\\main\\java\\com\\zongteng\\module_common\\bean\\' + modleRouter + '\\';
        const requestBeanPath = requestBeanPathParent + modleClassName + 'ScanReq.java';
        ensureDirectoryExistence(requestBeanPathParent);
        ensureDirectoryExistence(requestBeanPath);
        if (!fs.existsSync(requestBeanPath)) {
            fs.writeFileSync(requestBeanPath, `package com.zongteng.module_common.bean.${modleRouter};

/**
 * ${modelClassNote}扫描请求参数
 */
public class ${modleClassName}ScanReq {
    public String scanNo;
}`)
        }
    }

    const writeResponseBeanCode = (dbuPDAPath, modleRouter, modelClassNote, modleClassName) => {
        const responseBeanPathParent = dbuPDAPath + '\\module_common\\src\\main\\java\\com\\zongteng\\module_common\\bean\\' + modleRouter + '\\';
        const responseBeanPath = responseBeanPathParent + modleClassName + 'ScanResp.java';
        ensureDirectoryExistence(responseBeanPathParent);
        ensureDirectoryExistence(responseBeanPath);
        if (!fs.existsSync(responseBeanPath)) {
            fs.writeFileSync(responseBeanPath, `package com.zongteng.module_common.bean.${modleRouter};

import com.zongteng.module_common.bean.BaseBean;

/**
 * ${modelClassNote}扫描响应参数
 */
public class ${modleClassName}ScanResp extends BaseBean {
    public String scanNo;
}`)
        }
    }

    const writeApiCode = (dbuPDAPath, modelClassNote, modleClassName, selectedSys) => {
        // D:\git\dbu-hub-pda\module_common\src\main\java\com\zongteng\module_common\api\OpsApiUrl.java
        const apiPath = dbuPDAPath + '\\module_common\\src\\main\\java\\com\\zongteng\\module_common\\api\\' + (selectedSys.label == 'ops' ? 'Ops' : 'Tms') + 'ApiUrl.java';
        ensureDirectoryExistence(apiPath);
        if (fs.existsSync(apiPath)) {
            fs.readFile(apiPath, 'utf8', (err, data) => {
                if (data) {
                    if (data.includes(`public static final String ${selectedSys.label == 'ops' ? 'OPS' : 'TMS'}_${camelToUnderscore(modleClassName)}_SCAN = "/${selectedSys.label}/scan";`)) {
                        return
                    }
                    const oldCode = data.substring(0, data.lastIndexOf('}'))
                    const newCode = oldCode + `
    // -----------------------${modelClassNote}----------------------------------------------------------                
    public static final String ${selectedSys.label == 'ops' ? 'OPS' : 'TMS'}_${camelToUnderscore(modleClassName)}_SCAN = "/${selectedSys.label}/scan";
    // -----------------------${modelClassNote}END-------------------------------------------------------
}`
                    fs.writeFileSync(apiPath, newCode)
                }
            })
        }
    }

    const writeApiServiceCode = (dbuPDAPath, modleRouter, modelClassNote, modleClassName, selectedSys) => {
        // D:\git\dbu-hub-pda\module_common\src\main\java\com\zongteng\module_common\api\ApiService.java
        const apiServicePath = dbuPDAPath + '\\module_common\\src\\main\\java\\com\\zongteng\\module_common\\api\\ApiService.java';
        ensureDirectoryExistence(apiServicePath);
        if (fs.existsSync(apiServicePath)) {
            fs.readFile(apiServicePath, 'utf8', (err, data) => {
                if (data) {
                    if (data.includes(`${selectedSys.label == 'ops' ? 'OPS' : 'TMS'}_${camelToUnderscore(modleClassName)}_SCAN`)) {
                        return
                    }
                    const oldCode = data.substring(0, data.lastIndexOf('}'))
                    const lastBeanImportCode = data.substring(data.lastIndexOf('import com.zongteng.module_common.bean.'), data.indexOf('public interface ApiService {'))
                    const lastBeanImportCodeEnd = lastBeanImportCode.substring(0, lastBeanImportCode.indexOf(';') + 1)
                    console.log('lastBeanImportCodeEnd--->' + lastBeanImportCodeEnd)
                    const newImportCode = oldCode.replace(lastBeanImportCodeEnd, `${lastBeanImportCodeEnd}
import com.zongteng.module_common.bean.${modleRouter}.${modleClassName}ScanReq;
import com.zongteng.module_common.bean.${modleRouter}.${modleClassName}ScanResp;
`)
                    const newCode = newImportCode + `
    // -----------------------${modelClassNote}----------------------------------------------------------
    @POST(OpsApiUrl.${selectedSys.label == 'ops' ? 'OPS' : 'TMS'}_${camelToUnderscore(modleClassName)}_SCAN)
    Flowable<BaseDto<${modleClassName}ScanResp>> ${toCamelCase(modleClassName)}Scan(@Body ${modleClassName}ScanReq req);
    // -----------------------${modelClassNote}END-------------------------------------------------------
}`
                    fs.writeFileSync(apiServicePath, newCode)
                }
            })
        }
    }

    const writeItemLayoutCode = (dbuPDAPath, modleRouter, modelClassNote, modleClassName) => {
        // D:\git\dbu-hub-pda\app\src\main\res\layout\item_manual_sorting_scan.xml
        const itemLayoutPath = dbuPDAPath + '\\app\\src\\main\\res\\layout\\item_' + camelToUnderscore(modleClassName, false) + '_scan.xml';
        ensureDirectoryExistence(itemLayoutPath);
        if (!fs.existsSync(itemLayoutPath)) {
            fs.writeFileSync(itemLayoutPath, `<?xml version="1.0" encoding="utf-8"?>
<layout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools">
    <!-- ${modelClassNote}扫描列表子项 -->           
    <data>
        <variable
            name="data"
            type="com.zongteng.module_common.bean.${modleRouter.toLowerCase()}.${toCamelCase(modleClassName, true)}ScanResp" />

    </data>

    <androidx.constraintlayout.widget.ConstraintLayout
        android:layout_width="match_parent"
        android:background="@color/white"
        android:paddingVertical="@dimen/dp_10"
        android:paddingHorizontal="@dimen/dp_15"
        android:layout_height="wrap_content">
         <TextView
             android:id="@+id/tvScanNo"
             app:layout_constraintTop_toTopOf="parent"
             android:layout_width="match_parent"
             android:layout_height="wrap_content"
             android:textStyle="bold"
             android:text="@{data.nullToString(data.scanNo)}"
             android:textSize="@dimen/sp_16"
             android:textColor="@color/black"
             tools:text="OD02025016351465464"
             />

    </androidx.constraintlayout.widget.ConstraintLayout>
</layout>`)
        }
    }

    const writeAdapterCode = (dbuPDAPath, modleRouter, modelClassNote, modleClassName, selectedSys) => {
        // D:\git\dbu-hub-pda\app\src\main\java\com\zongteng\parcelhub\adapter\ops\sorting\ManualSortingScanAdapter.java
        const classNameStart = toCamelCase(modleClassName, true);
        const adapterPathParent = dbuPDAPath + '\\app\\src\\main\\java\\com\\zongteng\\parcelhub\\adapter\\' + selectedSys.label + '\\' + modleRouter + '\\';
        const adapterPath = adapterPathParent + classNameStart + 'ScanAdapter.java';
        ensureDirectoryExistence(adapterPathParent);
        ensureDirectoryExistence(adapterPath);
        if (!fs.existsSync(adapterPath)) {
            fs.writeFileSync(adapterPath, `package com.zongteng.parcelhub.adapter.${selectedSys.label}.${modleRouter};

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.chad.library.adapter.base.viewholder.BaseDataBindingHolder;
import com.zongteng.lib_base.adapter.BaseAdapter;
import com.zongteng.module_common.bean.${modleRouter}.${classNameStart}ScanResp;
import com.zongteng.parcelhub.R;
import com.zongteng.parcelhub.databinding.Item${classNameStart}ScanBinding;

import java.util.ArrayList;

/**
 * ${modelClassNote}扫描结果适配器
 * @author ykl
 * @date ${moment().format('YYYY-MM-DD')}
 */
public class ${classNameStart}ScanAdapter extends BaseAdapter<${classNameStart}ScanResp, Item${classNameStart}ScanBinding> {
    public ${classNameStart}ScanAdapter(@Nullable ArrayList<${classNameStart}ScanResp> data) {
        super(R.layout.item_${camelToUnderscore(modleClassName, false)}_scan, data);
    }
    @Override
    protected void convert(@NonNull BaseDataBindingHolder<Item${classNameStart}ScanBinding> holder, ${classNameStart}ScanResp ${toCamelCase(modleClassName)}ScanResp) {
        Item${classNameStart}ScanBinding binding=holder.getDataBinding();
        if (binding!=null) {
            binding.setData(${toCamelCase(modleClassName)}ScanResp);
        }
    }
}`)
        }
    }

    const writeModelCode = (dbuPDAPath, modleRouter, modleClassName, selectedSys) => {
        const modelPathParent = dbuPDAPath + '\\app\\src\\main\\java\\com\\zongteng\\parcelhub\\model\\' + selectedSys.label + '\\';
        const modelPath = modelPathParent + modleClassName + 'Model.java';
        ensureDirectoryExistence(modelPathParent);
        ensureDirectoryExistence(modelPath);
        if (!fs.existsSync(modelPath)) {
            const classNameStart = toCamelCase(modleClassName, true);
            fs.writeFileSync(modelPath, `package com.zongteng.parcelhub.model.${selectedSys.label};

import androidx.lifecycle.MutableLiveData;

import com.zongteng.lib_network.base.BaseDto;
import com.zongteng.module_common.bean.${modleRouter}.${classNameStart}ScanReq;
import com.zongteng.module_common.bean.${modleRouter}.${classNameStart}ScanResp;
import com.zongteng.parcelhub.api.ModelApi;
import com.zongteng.parcelhub.https.RequestRetrofit;
import com.zongteng.parcelhub.model.UploadFileModel;

public class ${classNameStart}Model extends UploadFileModel {
    public MutableLiveData<BaseDto<${classNameStart}ScanResp>> ${toCamelCase(modleClassName)}Scan(${classNameStart}ScanReq req) {
        return request(RequestRetrofit.getInstance().getService(ModelApi.class).${toCamelCase(modleClassName)}Scan(req)).get();
    }
}`)
        }
    }

    const writeViewModelCode = (dbuPDAPath, modleRouter, modleClassName, selectedSys) => {
        const viewModelPathParent = dbuPDAPath + '\\app\\src\\main\\java\\com\\zongteng\\parcelhub\\viewModel\\' + selectedSys.label + '\\';
        const viewModelPath = viewModelPathParent + modleClassName + 'ViewModel.java';
        ensureDirectoryExistence(viewModelPathParent);
        ensureDirectoryExistence(viewModelPath);
        if (!fs.existsSync(viewModelPath)) {
            const classNameStart = toCamelCase(modleClassName, true);
            fs.writeFileSync(viewModelPath, `package com.zongteng.parcelhub.viewModel.${selectedSys.label};

import androidx.annotation.NonNull;
import androidx.lifecycle.MutableLiveData;

import android.app.Application;

import com.blankj.utilcode.util.ToastUtils;
import com.zongteng.lib_network.base.HttpsStatus;
import com.zongteng.module_common.bean.${modleRouter}.${classNameStart}ScanReq;
import com.zongteng.module_common.bean.${modleRouter}.${classNameStart}ScanResp;
import com.zongteng.module_common.model.CommonViewModel;
import com.zongteng.parcelhub.BuildConfig;
import com.zongteng.parcelhub.model.${selectedSys.label}.${classNameStart}Model;
import com.zongteng.parcelhub.utils.DebugUtils;
import com.zongteng.parcelhub.utils.VoiceUtils;

public class ${classNameStart}ViewModel extends CommonViewModel<${classNameStart}Model> {
    public ${classNameStart}ViewModel(@NonNull Application application) {
        super(application);
    }

    public MutableLiveData<${classNameStart}ScanResp> m${classNameStart}Scan = new MutableLiveData<>();

    public MutableLiveData<${classNameStart}ScanResp> ${toCamelCase(modleClassName)}ScanData() {
        return m${classNameStart}Scan;
    }

    public void ${toCamelCase(modleClassName)}Scan(String scanNo) {
        ${classNameStart}ScanReq req = new ${classNameStart}ScanReq();
        req.scanNo = scanNo;
        if (BuildConfig.DEBUG) {
            m${classNameStart}Scan.postValue(DebugUtils.getInstance().getRandomObject(${classNameStart}ScanResp.class));
            return;
        }
        showLoadingDialog();
        mModel.${toCamelCase(modleClassName)}Scan(req).observe(this, response -> {
            hideLoadingDialog();
            if (response != null) {
                if (response.isSuccess()) {
                    m${classNameStart}Scan.postValue(response.getData());
                    VoiceUtils.playScanVoice(VoiceUtils.SUCCESS);
                } else {
                    if (response.getCode() == HttpsStatus.OPS_REPEAT_SCAN.getCode()) {
                        VoiceUtils.playScanVoice(VoiceUtils.REPEAT);
                        ToastUtils.showShort(response.getMsg());
                    } else {
                        showErrorDialog(response.getMsg());
                        VoiceUtils.playScanVoice(VoiceUtils.ERROR);
                    }
                }
            }
        });
    }
}`)
        }
    }

    const writeXmlCode = (dbuPDAPath, modelNameList, modelNoteList) => {
        for (const index in modelNameList) {
            const modelName = modelNameList[Number(index)]
            const modelNote = modelNoteList[Number(index)]
            const xmlPath = dbuPDAPath + '\\app\\src\\main\\res\\layout\\activity_' + camelToUnderscore(modelName, false) + '.xml';
            ensureDirectoryExistence(xmlPath);
            if (!fs.existsSync(xmlPath)) {
                fs.writeFileSync(xmlPath, `<?xml version="1.0" encoding="utf-8"?>
<layout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- ${modelNote} -->
    <data>

    </data>

    <androidx.constraintlayout.widget.ConstraintLayout
        android:layout_width="match_parent"
        android:layout_height="match_parent">
        <com.zongteng.parcelhub.widget.WidgetItemInput
            android:id="@+id/etSearch"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginHorizontal="@dimen/dp_15"
            android:layout_marginTop="@dimen/dp_5"
            app:hintStr="@string/please_scan"
            app:layout_constraintTop_toTopOf="parent"
            app:maxLine="1"
            app:rightBtStr="@string/confirm" />
        <androidx.recyclerview.widget.RecyclerView
            android:id="@+id/rvScanList"
            android:layout_width="match_parent"
            android:layout_height="0dp"
            android:layout_marginTop="@dimen/dp_10"
            app:layout_constraintTop_toBottomOf="@+id/etSearch"
            app:layout_constraintBottom_toBottomOf="parent"
            tools:listitem="@layout/item_${camelToUnderscore(modelName, false)}_scan"
            />
    </androidx.constraintlayout.widget.ConstraintLayout>
</layout>`)
            }
        }
    }

    const writeActivityCode = (dbuPDAPath, modleRouter, modelNameList, modelNoteList, selectedSys) => {
        const modlePermissionUpper = camelToUnderscore(modleRouter);
        const modleRouterCamel = toCamelCase(modleRouter);
        const modleRouterCamelUpper = toCamelCase(modleRouter, true);
        console.log('modelNameList--->' + modelNameList)
        for (const index in modelNameList) {
            // 4.生成Activity.java文件
            const modelName = modelNameList[Number(index)]
            const modelNote = modelNoteList[Number(index)]
            const activityPathParentParent = dbuPDAPath + '\\app\\src\\main\\java\\com\\zongteng\\parcelhub\\ui\\' + selectedSys.label + '\\';
            const activityPathParent = activityPathParentParent + modleRouterCamel + '\\';
            const activityPath = activityPathParent + modelName + 'Activity.java';
            ensureDirectoryExistence(activityPathParentParent);
            ensureDirectoryExistence(activityPathParent);
            ensureDirectoryExistence(activityPath);
            if (!fs.existsSync(activityPath)) {
                fs.writeFileSync(activityPath, `package com.zongteng.parcelhub.ui.${selectedSys.label}.${modleRouterCamel};

import android.os.Bundle;
import com.alibaba.android.arouter.facade.annotation.Route;
import com.zongteng.parcelhub.R;
import com.zongteng.lib_network.router.RouterPath;
${index == '0' ? `import com.zongteng.parcelhub.adapter.${selectedSys.label}.${modleRouterCamel}.${modelName}ScanAdapter;
import android.text.TextUtils;
import androidx.recyclerview.widget.LinearLayoutManager;
import com.blankj.utilcode.util.ToastUtils;
import com.zongteng.lib_base.utils.CustomClickListener;
import com.zongteng.module_common.widget.SpacesItemDecoration;
import com.zongteng.parcelhub.base.BaseScanActivity;` : 'import com.zongteng.parcelhub.base.BaseScanActivity;'}
import com.zongteng.parcelhub.databinding.Activity${modelName}Binding;
import com.zongteng.parcelhub.viewModel.${selectedSys.label}.${modelName}ViewModel;
/**
 * ${modelNote}
 */
@Route(path = RouterPath.${modlePermissionUpper}.${camelToUnderscore(modelName)}_ACTIVITY)
public class ${modelName}Activity extends BaseScanActivity<${modelName}ViewModel, Activity${modelName}Binding> {
    ${index == '0' ? `
    private ${modelName}ScanAdapter m${modelName}ScanAdapter;
    ` : '    '}
    @Override
    protected void onScanListener(String data) {
        ${index == '0' ? `onScan(data);` : ''}
    }

    @Override
    public int initContentView(Bundle savedInstanceState) {
        return R.layout.activity_${camelToUnderscore(modelName, false)};
    }
    ${index == '0' ? `
    private void onScan(String data) {
        if (!TextUtils.isEmpty(data)){
            mViewModel.${toCamelCase(modelName)}Scan(data);
        }
    }
    ` : `    `}
    @Override
    public void initView() {
        ${index == '0' ? `mBinding.etSearch.setCallBack(this::onScan);
        // ${modelNote}列表
        m${modelName}ScanAdapter = new ${modelName}ScanAdapter(null);
        mBinding.rvScanList.setLayoutManager(new LinearLayoutManager(this));
        mBinding.rvScanList.setAdapter(m${modelName}ScanAdapter);
        m${modelName}ScanAdapter.setEmptyView(com.zongteng.module_common.R.layout.layout_empty);
        mBinding.rvScanList.addItemDecoration(new SpacesItemDecoration(SpacesItemDecoration.VERTICAL_DIV));` : ``}
    }

    @Override
    public void initData(Bundle savedInstanceState) {
        ${index == '0' ? `mViewModel.${toCamelCase(modelName)}ScanData().observe(this, ${toCamelCase(modelName)}ScanResp -> {
            mBinding.etSearch.setContentNull();
            m${modelName}ScanAdapter.addData(0, ${toCamelCase(modelName)}ScanResp);
            mBinding.rvScanList.scrollToPosition(0);
            ToastUtils.showShort(getString(com.zongteng.lib_res.R.string.success));
        });` : ``}
    }

    @Override
    public String showTitle() {
        return getString(com.zongteng.lib_res.R.string.${camelToUnderscore(modelName, false)}_title);
    }${index !== '0' ? `
     
    @Override
    public boolean isShowExitDialog() {
        return false;
    }` : ''}
}`)
            }
        }
    }

    const writeManifest = (manifestPath, modleRouter, data, modelNameList, selectedSys) => {
        if (data) {
            let oldCode = data.substring(0, data.lastIndexOf('</application>'));
            // 生成Activity注册代码
            let newCode = ""
            const modleClassName = toCamelCase(modleRouter || modelNameList[0]);
            for (const index in modelNameList) {
                const modelName = modelNameList[Number(index)];
                newCode = newCode + `
        <activity
            android:name=".ui.${selectedSys.label}.${modleClassName}.${modelName}Activity"
            android:configChanges="orientation|screenSize|keyboardHidden|keyboard|navigation|locale|layoutDirection|uiMode|screenLayout"
            android:exported="false"
            android:windowSoftInputMode="adjustPan"
            android:screenOrientation="portrait" />`
            }
            newCode = oldCode + newCode + `
    </application>

</manifest>`
            if (!data.includes(`android:name=".ui.${selectedSys.label}.${toCamelCase(modleClassName)}.${modelNameList[0]}Activity"`)) {
                fs.writeFileSync(manifestPath, newCode)
            }
        }
    }

    return {
        camelToUnderscore,
        toCamelCase,
        ensureDirectoryExistence,
        getPublicString,
        writeRouterCode,
        writeStringsCode,
        writeRequestBeanCode,
        writeResponseBeanCode,
        writeApiCode,
        writeApiServiceCode,
        writeItemLayoutCode,
        writeAdapterCode,
        writeModelCode,
        writeViewModelCode,
        writeXmlCode,
        writeActivityCode,
        writeManifest,
    }
}

export default CreateMoudle;