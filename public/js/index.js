/**
 * Created by Administrator on 2017/12/18.
 */
//文件选择完毕时
function FileChangeFn(event) {
    $('.opst_txt').text('重新选择文件');
    $('.send_btn').show();
    var ofile = $("#oFile").get(0).files[0],
        otype = ofile.type,
        osize = ofile.size / 1054000,
        ourl = window.URL.createObjectURL(ofile);
    // console.log(ofile);
        // event = event || window.event;
    $('#file_type').text("选择上传文件类型："+ ofile.type);
    $('#file_size').text("选择上传文件大小，共"+ osize.toFixed(2) +"MB。");

    console.log("文件类型："+ otype); //文件类型
    console.log("文件大小："+ osize); //文件大小
    console.log("文件临时地址："+ ourl); //文件临时地址
};

//侦查附件上传情况 ,这个方法大概0.05-0.1秒执行一次
// function OnProgRess(event) {
//     var event = event || window.event;//console.log(event);  //事件对象
//     console.log("已经上传："+ event.loaded); //已经上传大小情况(已上传大小，上传完毕后就 等于 附件总大小)
//     console.log(event.total);  //附件总大小(固定不变)
//     var loaded = Math.floor(100 * (event.loaded / event.total)); //已经上传的百分比
//     $("#speed").html(loaded + "%").css("width", loaded + "%");
// };


//开始上传文件
function UploadFileFn() {
    var apkType = $("#selectType option:selected").val();
    if(apkType==''){
        alert('请选择应用类型');
        return
    };
    $('.speed_box').show();
    var oFile = $("#oFile").get(0).files[0],//input file标签
        formData = new FormData();//创建FormData对象

    formData.append("myFiles", oFile);//将上传name属性名(注意：一定要和 file元素中的name名相同)，和file元素追加到FormData对象中去

    // console.log("文件"+formData);

    $.ajax({
        type: "POST",
        url:  "http://localhost:3000/andriodLimit/analysisLimit", //后端服务器上传地址
        data: formData, //formData数据
        cache:false,  //是否缓存
        async: false,  //是否异步执行
        processData: false, // 是否处理发送的数据  (必须false才会避开jQuery对 formdata 的默认处理)
        contentType: false, // 是否设置Content-Type请求头
        success: function (returndata) {
            var data = JSON.parse(returndata);
            // console.log("11111111111"+returndata);
            var LimitsInfo = data.LimitsInfo;
            ShowLimitsInfo(LimitsInfo,oFile.name);
        },
        error: function (returndata) {
            alert('请正确配置后台服务！');
        }
    });
};

//拿到返回数据后,将权限信息展示给客户端
function ShowLimitsInfo(LimitsInfo,name) {
    //以\r\n为间隔将字符串转化为数组
    // console.log(LimitsInfo);
    var arr = LimitsInfo.split("\r\n");
    replaceEmptyItem(arr);
    // console.log(arr);
    cutString(arr);
    replaceEmptyItem(arr);
    console.log(arr);
    // return;
    var paperStr = '';
    for (var i = 0; i < arr.length; i++) {
        if (i == arr.length-1){
            paperStr = paperStr + "'" + arr[i] +"'";
        }else {
            paperStr = paperStr + "'" + arr[i] +"',";
        }
    }
    var data = "LimitsName="+paperStr;
    alert(data);
    request('http://localhost:3000/andriodLimit/selectLimitsInfo',data,function (data) {
        if (isDefine(data.status) && data.status != 0) {
            alert(data.message);
        }else{
            var module = template("msglist",data);
            $("#LimitsInfo").html(module);
            // //对返回的权限信息进行处理，方便存入数据库
            // var LimitsNumberA = "";
            // var LimitsNumberC = "";
            // for (var i = 0; i < data.data.length; i++) {
            //     if (i == data.data.length-1){
            //         LimitsNumberA = LimitsNumberA + data.data[i].LimitsNumber;
            //         LimitsNumberC = LimitsNumberC + "'" + data.data[i].LimitsNumber + "'";
            //     }else {
            //         LimitsNumberA = LimitsNumberA + data.data[i].LimitsNumber + ",";
            //         LimitsNumberC = LimitsNumberC + "'" + data.data[i].LimitsNumber + "',";
            //     }
            // }
            // name = "'"+ name +"'";
            // checkDuplicate(name,LimitsNumberA,LimitsNumberC);
        }
    })
}

//查询apk信息是否已录入
function checkDuplicate(ApkName,LimitsNumberA,LimitsNumberC) {
    var data = "ApkName="+ApkName;
    request('http://localhost:3000/andriodLimit/selectApkInfo',data,function (data) {
        if (isDefine(data.status) && data.status != 0) {
            alert(data.message);
        }else{
            if (isDefine(data.data)) {
                // alert("已录入");
            }else{
                alert("未录入");
                insertApkInfo(ApkName,LimitsNumberA);//录入apk信息
                updateCountif(LimitsNumberC);//更新权限出现次数
            }
        }
    });
}

//录入apk信息
function insertApkInfo(ApkName,LimitsNumber) {
    var apkType = $("#selectType option:selected").val();
    var data = "ApkName="+ApkName+"&LimitsNumber='"+LimitsNumber+"'"+"&apkType='"+apkType+"'";
    console.log(data);
    request('http://localhost:3000/andriodLimit/insertApkInfo',data,function (data) {
        if (isDefine(data.status) && data.status != 0) {
            alert(data.message);
        }else{
            if (isDefine(data.data)) {
                alert(data.message);
            }else{
                alert(data.message);
            }
        }
    });
}

//更新权限出现次数
function updateCountif(LimitsNumber) {
    var data = "LimitsNumber="+LimitsNumber;
    request('http://localhost:3000/andriodLimit/updateCountif',data,function (data) {
        if (isDefine(data.status) && data.status != 0) {
            alert(data.message);
        }else{
            if (isDefine(data.data)) {
                alert(data.message);
            }else{
                alert(data.message);
            }
        }
    });
}

//截取字符串中的一部分
function cutString(arr) {
    for(var i = 0,len = arr.length;i < len;i++) {
        var middle = arr[i];
        // alert(middle);
        // var str = "uses-permission: android.permission.WRITE_CONTACTS";
        // str = str.match(/uses-permission: (\S*)/);
        // alert(str);//结果bbbcccdddeeefff
        middle = middle.match(/permission: name='(\S*)'/);
        // console.log(middle);
        // var middle = arr[i].slice(16);
        if(middle != null){
            arr[i] = middle[1];
        }else {
            arr[i] = null;
        };
    }
}

//去除数组空项
function replaceEmptyItem(arr){
    for(var i=0,len=arr.length;i<len;i++){
        if(!arr[i]|| arr[i]==''||arr[i]==null){
            arr.splice(i,1);
            len--;
        }
    }
}

//检查是否为空
function isDefine(value) {
    if (value == null || value == "" || value == "undefined" || value == undefined || value == "null" || value == "(null)" || value == 'NULL' || typeof (value) == 'undefined') {
        return false;
    } else {
        value = value + "";
        value = value.replace(/\s/g, "");
        if (value == "") {
            return false;
        }
        return true;
    }
}
