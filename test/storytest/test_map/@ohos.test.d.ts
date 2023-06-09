/*
* Copyright (c) 2022 Shenzhen Kaihong Digital Industry Development Co., Ltd. 
* Licensed under the Apache License, Version 2.0 (the "License"); 
* you may not use this file except in compliance with the License. 
* You may obtain a copy of the License at 
*
* http://www.apache.org/licenses/LICENSE-2.0 
*
* Unless required by applicable law or agreed to in writing, software 
* distributed under the License is distributed on an "AS IS" BASIS, 
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
* See the License for the specific language governing permissions and 
* limitations under the License. 
*/
declare namespace napitest {
    interface TestClass1 {
        map1 : {[key: string]: Array<number>} ;
    }

    interface TestClass2 {
        fun1(v: {[key: string]: string}):  number;
        fun2(v: {[key: string]: number}):  number;
        fun3(v: {[key: string]: boolean}):  number;
        fun4(v: {[key: string]: Array<string>}):  number;
        fun5(v: {[key: string]: Array<number>}):  number;
        fun6(v: {[key: string]: Array<boolean>}):  number;
    }
}
export default napitest;