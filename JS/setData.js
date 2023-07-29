let arr=[];
let tags=[];
let tagObjs=[];
let ctr=0;
let tagctr=0;

if(!localStorage.getItem("arr")){
    localStorage.setItem("arr", JSON.stringify(arr));
}
if(!localStorage.getItem("tags")){
    localStorage.setItem("tags", JSON.stringify(tags));
}
if(!localStorage.getItem("tagObjs")){
    localStorage.setItem("tagObjs", JSON.stringify(tagObjs));
}
if(!localStorage.getItem("ctr")){
    localStorage.setItem("ctr", JSON.stringify(ctr));
}
if(!localStorage.getItem("tagctr")){
    localStorage.setItem("tagctr", JSON.stringify(tagctr));
}



