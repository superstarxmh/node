var express = require('express');
var router = express.Router();
var multiparty = require('multiparty');
var util = require('util');
var fs = require('fs');
var cmd = require('node-cmd');
// 导入MySQL模块
var mysql = require('mysql');
var dbConfig = require('../db/DBConfig');
var SQL = require('../db/SQL');
// 使用DBConfig.js的配置信息创建一个MySQL连接池
var pool = mysql.createPool( dbConfig.mysql );


/* 上传文件*/
    router.post('/analysisLimit', function(req, res, next){
    var limitsInfo;
    //生成multiparty对象，并配置上传目标路径
    var form = new multiparty.Form({uploadDir: './public/files/'});
    //上传完成后处理
    form.parse(req, function(err, fields, files) {
        if(err){
            console.log('parse error: ' + err);
        } else {
            var inputFile = files.myFiles[0];
            var uploadedPath = inputFile.path;
            var dstPath = './public/files/' + inputFile.originalFilename;
            //重命名为真实文件名
            fs.rename(uploadedPath, dstPath, function(err) {
                if(err){
                    console.log('rename error: ' + err);
                } else {
                    console.log('rename ok');
                }
            });
        }

        // 调用cmd命令取出权限信息
        cmd.get(
            'aapt dump permissions '+dstPath,
            function(err, data, stderr){
                limitsInfo = data;
                console.log(limitsInfo);
                console.log('aapt dump permissions '+dstPath);
            }
        );
        cmd.run();
        res.writeHead(200, {'content-type': 'text/plain'});
        setTimeout(function() {//调用cmd命令取出权限信息需要时间，延时0.3秒。
            res.end(
                JSON.stringify({status:0,message:'请求成功',LimitsInfo:limitsInfo})
            );
            // fs.rmdirSync('./public/files/');
            deleteall('./public/files/');
            mkdirs('./public/files');
        }, 600);
    });
});

// 查询权限信息
router.get('/selectLimitsInfo', function(req, res, next){
    // 从连接池获取连接
    pool.getConnection(function(err, connection) {
    // 获取前台页面传过来的参数
        var param = req.query || req.params;
        // 建立连接
        connection.query({sql: SQL.selectLimitInfo + "(" +param.LimitsName + ")"},
            function(err, result) {
                if(result) {
                    res.end(JSON.stringify({status:0, message:'请求成功', data:result}));
                }else {
                    res.end(JSON.stringify({status:-1, message:'请求失败'}));
                }
                // 释放连接
                connection.release();
            }
        );
    });
});

// 查询apk信息
router.get('/selectApkInfo', function(req, res, next){
    // 从连接池获取连接
    pool.getConnection(function(err, connection) {
        // 获取前台页面传过来的参数
        var param = req.query || req.params;
        // url编码：decodeURI(string)
        // url解码：encodeURI(string)
        var ApkName = encodeURI(param.ApkName);
        // 建立连接
        connection.query({sql: SQL.selectApkInfo + ApkName}, function(err, result) {
                if(result) {
                    res.end(JSON.stringify({status:0, message:'请求成功',data:result}));
                }else {
                    res.end(JSON.stringify({status:-1, message:'请求失败',data:result}));
                }
                // 释放连接
                connection.release();
            }
        );
    });
});

// 录入apk信息
router.get('/insertApkInfo', function(req, res, next){
    // 从连接池获取连接
    pool.getConnection(function(err, connection) {
        // 获取前台页面传过来的参数
        var param = req.query || req.params;
        // url编码：decodeURI(string)
        // url解码：encodeURI(string)
        var ApkName = encodeURI(param.ApkName),
            LimitsNumber = encodeURI(param.LimitsNumber),
            ApkType = encodeURI(param.apkType);
        console.log(SQL.insertApkInfo + "(" + ApkName + "," + LimitsNumber  + "," + ApkType + ")");
        // 建立连接
        connection.query({sql: SQL.insertApkInfo + "(" + ApkName + "," + LimitsNumber  + "," + ApkType + ")"}, function(err, result) {
                if(result) {
                    // console.log(result);
                    res.end(JSON.stringify({status:0, message:'操作成功'}));
                }else {
                    res.end(JSON.stringify({status:-1, message:'操作失败'}));
                }
                // 释放连接
                connection.release();
            }
        );
    });
});

// 更新权限出现次数
router.get('/updateCountif', function(req, res, next){
    // 从连接池获取连接
    pool.getConnection(function(err, connection) {
        // 获取前台页面传过来的参数
        var param = req.query || req.params;
        // url编码：decodeURI(string);url解码：encodeURI(string)
        var LimitsNumber = encodeURI(param.LimitsNumber);
        console.log(SQL.updateCountif + "(" + LimitsNumber + ")");
        connection.query({sql: SQL.updateCountif + "(" + LimitsNumber + ")"},
            function(err, result) {
                if(result) {
                    res.end(JSON.stringify({status:0, message:'请求成功'}));
                }else {
                    res.end(JSON.stringify({status:-1, message:'请求失败'}));
                }
                // 释放连接
                connection.release();
            }
        );
    });
});

//删除文件夹及文件
function deleteall(path) {
    var files = [];
    if(fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function(file) {
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                deleteall(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};


//创建目录结构
function mkdirs(dirpath) {
    fs.mkdir(dirpath, function (err) {
        if(err)
            throw err;
            console.log('创建目录成功')
       });
}

module.exports = router;