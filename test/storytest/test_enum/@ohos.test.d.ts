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
import { Callback } from './../basic';

declare namespace napitest {
    export enum GrantStatus {
        PERMISSION_DEFAULT = "",
        PERMISSION_DENIED = "-1",
        PERMISSION_GRANTED = "2",
        PERMISSION_PASS = "3",
    }

    export enum HttpStatus {
        STATUS0 = 0,
        STATUS1 = 500,
        STATUS2 = 503,
    }
    function fun1(v1: GrantStatus): HttpStatus;
    function fun2(v1: HttpStatus): GrantStatus;
    function fun3(reason: string, callback: Callback<HttpStatus>): void;
}

export default napitest;
