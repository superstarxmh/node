function request(url, data, successFunction) {
    
    var paramData = data ;
    $.ajax({
        data:paramData,
        dataType: 'json',
        type: 'get',
        url: url,
        cache:false,  //是否缓存
        async: false,  //是否异步执行
        processData: false, // 是否处理发送的数据  (必须false才会避开jQuery对 formdata 的默认处理)
        contentType: false, // 是否设置Content-Type请求头
        success: function (data) {
            if (isDefine(data.status) && data.status != 0) {
                // console.log(paramData);
                alert(data.message);
            } else {
                successFunction(data);
            }
        },
        error: function (data) {
            alert('请正确配置后台服务！'+ data.message);
        }
    });
}