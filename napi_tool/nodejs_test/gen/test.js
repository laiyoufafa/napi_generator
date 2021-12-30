const test = require("./build/Release/napitest")

//直接返回
let result = test.fun2("direct", [1, 2, 3], {name: "cc", age: 20})
console.log(result)

//同步回调
test.fun3("callback", function (ret) {console.log(ret)})

// function cb(ret)
// {
//     console.log(ret)
// }
//异步回调
function test_async() {
    test.fun4("async", function (ret) {console.log(ret)})
    test.fun4("promise").then(ret => {console.log(ret);})
}
test_async()
// //promise

let tc1 = new test.TestClass1()
tc1.str1 = "asdf"
console.log(tc1.str1)
console.log(tc1.if_direct("123"))

tc1.if_callback("abc", function (ret) {console.log(ret)})
tc1.if_async("world").then(ret => {console.log(ret)})

console.log(test.Space3.fun3("ccnto"))
let tc2 = new test.Space3.Space4.TestClass3()
console.log("hoho=", tc2.add([3,4,5]))
console.log("==== end ====")

setTimeout(function () {
    console.log('interval')
}, 100);

// function asdfasdf(ret)
// {
//     console.log(ret)
// }
