/**
 * Created by Administrator on 2017/12/21.
 */
var SQL = {
    selectLimitInfo:'SELECT * FROM limitsinfo WHERE LimitsName in ',//查询权限信息
    selectApkInfo:'SELECT * FROM apkinfo WHERE ApkName = ',
    insertApkInfo:'INSERT INTO apkinfo (ApkName,LimitsNumber,ApkType) VALUES ',
    updateCountif:'UPDATE limitsinfo SET Countif=Countif+1 WHERE LimitsNumber in'
};
module.exports = SQL;
