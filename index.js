var express = require('express');
var mysql = require('mysql');
// var request = require('request');
const bodyParser = require('body-parser');
const request = require('request');
const cors = require('cors');
const router = express.Router();
const app = express();
var db = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'network629',
    database:'test'
  });
  db.connect();



app.use(cors());
// app.use(bodyParser.urlencoded({ extended: false }));

router.get('/', cors(), (req, res) => { res.send('cors!') });

app.get('/', function (req, res) {
    db.query(`SELECT * FROM topic`, function(error,topics){
        var option = {
            method: "POST",
            uri: 'https://kapi.kakao.com/v1/payment/ready',
            form: {
                cid: "TC0ONETIME",
                partner_order_id: "partner_order_id",
                partner_user_id: "partner_user_id",
                item_name: "초코파이",
                quantity: 1,
                total_amount: 2200,
                vat_amount: 200,
                tax_free_amount: 0,
                approval_url: "http://localhost:3000/auth",
                fail_url: "http://localhost:3000/",
                cancel_url: "http://localhost:3000/"
            },
            headers: {
                'Authorization': 'KakaoAK a1355d29b2de8657244d9548bf1a4ea9',
                'Content-Type': 'application/json;charset=UTF-8', //'application/x-www-form-urlencoded;charset=utf-8'
            },
        };
    
    
        request(option, function (err, response) {
            if (err) throw err;
            //console.log(typeof(response.body));    // string type 확인 
            var object = response.body.split(',');   // next_redirect_pc_url 부분 커팅 
            var temp_tid = object[0].split(':');
            tid = temp_tid[1].slice(1, -1);
            // console.log(tid);                       // tid 확인
            var address = object[4].split(':');
            var temp_url = address[2].slice(0, -1);
            var next_redirect_pc_url = 'https:' + temp_url;
            //console.log(next_redirect_pc_url);         // 주소 확인 
            res.redirect(next_redirect_pc_url);
        });
    });
});


app.get('/auth', function (req, res) {
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    //console.log(fullUrl);                    // 요청된 url 확인 
    console.log(req.query.pg_token);       // pg_token 확인
    var t = tid;
    console.log(t);

    var option = {
        method: "POST",
        uri: 'https://kapi.kakao.com/v1/payment/approve',
        form: {
            cid: "TC0ONETIME",
            tid: t,
            partner_order_id: "partner_order_id",
            partner_user_id: "partner_user_id",
            pg_token: req.query.pg_token,
        },
        headers: {
            'Authorization': 'KakaoAK a1355d29b2de8657244d9548bf1a4ea9',
            'Content-Type': 'application/json;charset=UTF-8', //'application/x-www-form-urlencoded;charset=utf-8'
        },
    };

    request(option, function (err, response) {
        if (err) throw err;
        res.redirect('/success');
    });
});

app.get('/success', function(req, res){
    res.send('결제가 완료되었습니다.');
})


app.listen(3000, function () {
    console.log('서버 실행');
});