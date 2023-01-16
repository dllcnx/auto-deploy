(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.AesConfig = factory();
    }

})(this, function () {
    const AesConfig = {
        AES_KEY: '0123456789abcdef',
        AES_IV: 'abcdef0123456789'
    }
    return AesConfig
});