function generateEncryptedLink(bank, userData, key = "mySecretKey") {
    function xorEncrypt(text, key) {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return result;
    }

    function base64UrlEncode(str) {
        return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    const urls = {
        "pagi": "https://online.pagi.co.il/MatafLoginService/MatafLoginServlet",
        "poalim-iski": "https://biz2.bankhapoalim.co.il/ng-portals/auth/he/biz-login/authenticate",
        "poalim": "https://login.bankhapoalim.co.il/ng-portals/auth/he/"
    };

    const requiredFields = {
        "pagi": ["userName", "password", "zheut"],
        "poalim-iski": ["userName", "password"],
        "poalim": ["userName", "password"]
    };

    if (!urls[bank]) throw new Error("Bank not supported");

    const data = {};
    for (const field of requiredFields[bank]) {
        if (!userData[field]) throw new Error(`Missing field: ${field}`);
        data[field] = userData[field];
    }

    const json = JSON.stringify(data);
    const encrypted = xorEncrypt(json, key);
    const encoded = base64UrlEncode(encrypted);
    
    const delimiter = bank === 'pagi' || bank === 'poalim-iski' ? '#' : '?';
    return `${urls[bank]}${delimiter}ydf=${encoded}`;
}
