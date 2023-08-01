let arr=[];
let tags=[];
let tagObjs=[];
let filterTags=[];
let ctr=0;
let tagctr=0;

let activity_log={

};


if(!localStorage.getItem("arr")){
    localStorage.setItem("arr", JSON.stringify(arr));
    localStorage.setItem("tags", JSON.stringify(tags));
    localStorage.setItem("tagObjs", JSON.stringify(tagObjs));
    localStorage.setItem("ctr", JSON.stringify(ctr));
    localStorage.setItem("tagctr", JSON.stringify(tagctr));
    localStorage.setItem("activity_log", JSON.stringify(activity_log));
}
else{
    arr=JSON.parse(localStorage.getItem("arr"));
    tags=JSON.parse(localStorage.getItem("tags"));
    tagObjs=JSON.parse(localStorage.getItem("tagObjs"));
    ctr=JSON.parse(localStorage.getItem("ctr"));
    tagctr=JSON.parse(localStorage.getItem("tagctr"));
    activity_log=JSON.parse(localStorage.getItem("activity_log"));
}

let priority_chart={
    "low" : 1,
    "medium" : 2,
    "high" : 3
};

let rev_priority_chart={
    "1":"low",
    "2" :"medium",
    "3" :"high"
};

class Obj{
    constructor(key, value, category="None", priority, dueDate, alertDate=""){
        this.key=key;
        this.value=value;
        this.completed=false;
        this.subtasks=[];
        this.ctr=0;
        this.category=category;
        this.priority=priority_chart[priority];
        this.dueDate=dueDate;
        this.alertDate=alertDate;
        this.tags=[];
    }
}

class TagObj{
    constructor(key, value){
        this.key=key;
        this.value=value;
        this.tasks=[];
    }
}

class SubObj{
    constructor(key, value){
        this.key=key;
        this.value=value;
        this.completed=false;
    }
}

// Functions

function addToLog(activity){
    let k1=new Date().getTime();
    activity_log[k1]=activity;
}

function add(key1, task, category="None", priority, dueDate){
    let obj=new Obj(key1, task, category, priority, dueDate);
    arr.push(obj);
    return obj;
}

function addSub(id, subtask){
    
    let index1 = arr.findIndex((obj) => obj.key==id);
    arr[index1].ctr+=1;
    let subObj=new SubObj(arr[index1].ctr, subtask);
    arr[index1].subtasks.push(subObj);

    addToLog("Subtask with Id "+arr[index1].ctr.toString()+" of task " +id.toString() + " added");
}

function del(id){
    let index = arr.findIndex((obj) => obj.key==id);
    arr.splice(index, 1);
}

function edit(index, task, category, priority, dueDate){
    arr[index].value=task;
    arr[index].category=category;
    arr[index].priority=priority_chart[priority];
    arr[index].dueDate=dueDate;
}

function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
}

function operation(list1, list2, isUnion) {
    let result = [];
    
    for (let i = 0; i < list1.length; i++) {
        let item1 = list1[i],
            found = false;
        for (let j = 0; j < list2.length && !found; j++) {
            found = item1.key === list2[j].key;
        }
        if (found === !!isUnion) { // isUnion is coerced to boolean
            result.push(item1);
        }
    }
    return result;
}

function inBoth(list1, list2) {
    return operation(list1, list2, true);
}

function filter(category, priority, sdueDate, edueDate, tagsarr){
    //console.log(tagsarr);
    let newArray = arr.filter(function (el) {
        let cond=true;
        if(category!=""){
            cond=cond && (el.category==category);
        }
    
        if(priority!="all"){
            cond=cond && (el.priority==priority_chart[priority]);
        }
    
        let dd=new Date(el.dueDate).getTime();
        if(sdueDate!=""){
            sdueDate=new Date(sdueDate).getTime();
            cond=cond && (dd>=sdueDate);
        }
        
        if(edueDate!=""){
            edueDate=new Date(edueDate).getTime();
            cond=cond && (dd<=edueDate);
        }
        return cond;
    }
    );

    if(tagsarr.length){
        let tagfltrArr=[];
        let l=tagsarr.length;
        for(let i=0; i<l; i++){
            let tagidx=tagObjs.findIndex((obj) => obj.value==tagsarr[i]);
            tagfltrArr=tagfltrArr.concat(tagObjs[tagidx].tasks);
        }
        // newArray=newArray.filter(obj => tagfltrArr.includes(obj));
        newArray=inBoth(newArray, tagfltrArr);
    }
    renderAll(newArray);
}

function compare(parameter, order){
    return function(a,b){
        let m;
        if(order=="asc") m=1;
        else m=-1;

        if(parameter=="key" || parameter=="priority"){
            if(a[parameter]<b[parameter]){
                return m*-1;
            }
            else{
                return m*1;
            }
        }

        else{
            let x=new Date(a[parameter]).getTime();
            let y=new Date(b[parameter]).getTime();
            if(x<y){
                return m*-1;
            }
            else{
                return m*1;
            }
        }
    }
}

function sort(parameter, order){
    arr=arr.sort(compare(parameter, order));
}

function search(parameter, term){
    let newArr;
    if(parameter=="task"){
        newArr=arr.filter(function (el) {
            return el.value==term;
        })
    }
    else if(parameter=="subtask"){
        newArr=arr.filter(function(el){
            return (el.subtasks.filter(
                e => e.value === term
            ).length>0);
        })
    }
    else{
        newArr=arr.filter(function (el) {
            cond=false;
            cond=cond || el.value.includes(term);
            cond=cond || el.subtasks.filter(
                e => e.value.includes(term)
            ).length>0;
            return cond;
        });
    }

    renderAll(newArr);
}

// Rendering Tasks

function render(obj1){
    let ul=document.querySelector('#listUL');
    let li=document.createElement('li');
    
    let div_outer=document.createElement('div');
    
    let div_inner=document.createElement('div');
    let div_btn=document.createElement('div');
    let div_st=document.createElement('div');
    let div_stv=document.createElement('div');
    let div_alrt=document.createElement('div');
    let div_btns=document.createElement('div');

    div_btn.innerText='Delete';
    div_btn.classList.add('lbtn');
    let ctr=obj1.key;
    div_btn.classList.add(ctr.toString());

    div_st.innerText="Add Subtasks";
    div_st.classList.add('stbtn');
    div_st.classList.add(ctr.toString());

    div_stv.innerText="View Subtasks";
    div_stv.classList.add('stvbtn');
    div_stv.classList.add(ctr.toString());

    div_alrt.innerText="Set Alert";
    div_alrt.classList.add('alrtbtn');
    div_alrt.classList.add(ctr.toString());

    
    div_btns.classList.add('btns-div');
    div_btns.appendChild(div_stv);
    div_btns.appendChild(div_st);
    div_btns.appendChild(div_btn);
    div_btns.appendChild(div_alrt);

    let checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.name = "name";
    checkbox.value = "value";
    checkbox.classList.add("check");
    checkbox.classList.add(ctr.toString());

    div_inner.appendChild(checkbox);
    let time_text="( Upcoming )";
    if(new Date().getTime() > new Date(obj1.dueDate).getTime()){
        time_text="( Expired )";
    }
    let inner_txt=`${obj1.value} || Priority - ${rev_priority_chart[obj1.priority.toString()]} || Category - ${obj1.category} || ${time_text} || ${obj1.dueDate} || `;
    obj1.tags.forEach((tag)=>{
        let tagrndrindex = tagObjs.findIndex((obj) => obj.key==tag);
        inner_txt+=`${tagObjs[tagrndrindex].value} ,`
    })
    inner_txt=inner_txt.substring(0, inner_txt.length-1);
    let textNode = document.createTextNode(inner_txt);
    div_inner.appendChild(textNode);
    div_inner.classList.add('litem');
    
    if(obj1.completed){
        div_inner.classList.add('bg-green');
        checkbox.checked=true;
    }
    else{
        if(obj1.alertDate!=""){
            if(new Date().getTime() >= new Date(obj1.alertDate).getTime()){
                div_inner.classList.add('bg-yellow');
            }
        }
        else{
            div_inner.classList.add('bg-blue');
        }
        checkbox.checked=false;
    }

    
    div_inner.classList.add(ctr.toString());


    div_outer.appendChild(div_inner);
    div_outer.appendChild(div_btns);
    div_outer.classList.add('list-item-div');

    li.appendChild(div_outer);
    li.draggable=true;
    li.classList.add("drag-li");
    li.classList.add(ctr.toString());

    li.addEventListener("dragstart", ()=>{
        li.classList.add('dragging');
    })
    li.addEventListener("dragend", ()=>{
        li.classList.remove('dragging');
    })

    ul.appendChild(li);
}


function renderAll(myArr=arr){
    let ul=document.querySelector('#listUL');
    ul.innerHTML=""
    let len=myArr.length;
    for(i=len-1; i>=0; i--){
        render(myArr[i]);
    }
}

renderAll();

//rendering Subtasks

function renderSub(par, obj1){
    let ul=document.querySelector('#stul');
    let li=document.createElement('li');
    
    let div_outer=document.createElement('div');
    
    let div_inner=document.createElement('div');

    let checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.name = "name";
    checkbox.value = "value";
    checkbox.classList.add("check");
    checkbox.classList.add(obj1.key.toString());
    checkbox.classList.add(par.key.toString());

    div_inner.appendChild(checkbox);
    let textNode = document.createTextNode(obj1.value);
    div_inner.appendChild(textNode);
    div_inner.classList.add('sublitem');
    
    if(obj1.completed){
        div_inner.classList.add('bg-green');
        checkbox.checked=true;
    }
    else{
        div_inner.classList.add('bg-blue');
        checkbox.checked=false;
    }

    div_inner.classList.add(obj1.key.toString());
    div_inner.classList.add(par.key.toString());


    div_outer.appendChild(div_inner);
    div_outer.classList.add('list-item-div');

    li.appendChild(div_outer);

    ul.appendChild(li);
}

function renderSubtasks(id){
    let stul=document.getElementById('stul');
    stul.innerHTML="";
    let index = arr.findIndex((obj) => obj.key==id);
    let task=document.querySelector('.taskname');
    task.innerText=arr[index].value;
    let len=arr[index].subtasks.length;
    for(let i=0; i<len; i++){
        renderSub(arr[index], arr[index].subtasks[i]);
    }
}


// fetching using API

// fetch('https://jsonplaceholder.typicode.com/todos')
// .then((response) => {
//     if (!response.ok) {
//         throw new Error('Network response was not OK');
//     }
//     return response.json();
// })
// .then((data) => {
//     // Process the received data
//     //console.log(data);
//     let n=data.length;
//     for(let i=0; i<n; i++){
//         let obj=data[i];
//         ctr+=1;
//         add(ctr, obj.title);
//     }

//     renderAll();
// })
// .catch(error => {
//     // Handle any errors that occurred during the fetch request
//     console.log('Error:', error.message);
// });


//Adding a task

let currTags=[];

function extractTaskAndDate(inputText) {
    const dueDate = extractDeadlineFromDateText(inputText);
    let task = inputText.trim();
    const byIndex = inputText.toLowerCase().indexOf("by");

    if (byIndex !== -1) {
        task = inputText.slice(0,byIndex).trim();
    }

    if (dueDate) {
        // console.log(task);
        // console.log(dueDate);
        return { "modifiedTodoText":task, "dueDate":dueDate };
    }
    else
    {
        return null;
    }
}

function extractDeadlineFromDateText(inputText) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const crntDayKeywords = ["today", "eod", "end of day", "this day"];
    const tomorrowKeywords = ["tomorrow", "tmrw", "next day", "nextday"];
    const dateRegex = /(\d{1,2})(st|nd|rd|th)?(\s)?(jan(uary)?|feb(ruary)?|mar(ch)?|apr(il)?|may|jun(e)?|jul(y)?|aug(ust)?|sep(t(ember)?)?|oct(ober)?|nov(ember)?|dec(ember)?)(\s)?(\d{4})?/i;
    const timeRegex = /(\d{1,2})(:(\d{2}))?(\s)?(am|pm)/i;

    let date = null;
    let matches;

    if (crntDayKeywords.some((keyword) => inputText.toLowerCase().includes(keyword))) {
        date = today;
        //date.setHours(23,59,59);
        // console.log(date+" date");
    }

    // Check if input text contains any of the tomorrow keywords
    if (tomorrowKeywords.some((keyword) => inputText.toLowerCase().includes(keyword))) {
        date = tomorrow;
        //date.setHours(23,59,59);
    }

    // Check if input text contains date information using regex
    if ((matches = inputText.match(dateRegex))) {
        const day = parseInt(matches[1], 10);
        const month = getMonthNumberFromMonthName(matches[4]);
        const year = matches[13] ? parseInt(matches[13], 10) : today.getFullYear();
        date = new Date(year, month, day);
    }

    // Check if input text contains time information using regex
    if ((matches = inputText.match(timeRegex))) {
        let hours = parseInt(matches[1], 10);
        const minutes = matches[3] ? parseInt(matches[3], 10) : 0;

        if (matches[5].toLowerCase() === "pm" && hours < 12) {
            hours += 12;
        } else if (matches[5].toLowerCase() === "am" && hours === 12) {
            hours = 0;
        }

        if (date) {
            date.setHours(hours, minutes);
        } else {
            date = new Date();
            date.setHours(hours, minutes);
        }
    }

    // if (date) {
    //     date.setMinutes(date.getMinutes() + 330);
    // }
    
    // console.log(date+" date");
    // return date ? date.toISOString().slice(0, 16) : "";

    if(date){
        return date
    }
}

function getMonthNumberFromMonthName(monthName) {
    const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    return monthNames.indexOf(monthName.toLowerCase().slice(0, 3));
}

function addEle(){
    let task = document.getElementById("myInput").value;
    let category = document.getElementById("myCategory").value;
    if(category==""){
        category="None";
    }
    let priority = document.getElementById("myPriority").value;
    let dueDate = document.getElementById("myDate").value;
    
    document.getElementById("myInput").value = "";
    document.getElementById("myCategory").value = "";
    document.getElementById("myPriority").selected = "Low";
    document.getElementById("myDate").value = "yyyy-MM-dd";

    ctr+=1;
    addToLog("Task with Id " + ctr.toString() + " added");

    let modD=extractTaskAndDate(task);
    
    if(modD){
        task=modD["modifiedTodoText"];
        dueDate=modD["dueDate"];
        dueDate=new Date(dueDate).toISOString().slice(0,10)
    }

    if(task==""){
        alert("Can not add task without any content");
    }
    else if(dueDate==""){
        alert("Have to add due date to add a task");
    }
    else{
        let objtemp=add(ctr, task, category, priority, dueDate);
        let taglen=currTags.length;
        for(let i=0; i<taglen; i++){
            if(objtemp.tags.includes(currTags[i])==false){
                let tagidx=tagObjs.findIndex((obj) => obj.value==currTags[i]);
                objtemp.tags.push(tagObjs[tagidx].key);
                tagObjs[tagidx].tasks.push(objtemp);
            }
        }
        renderAll();
    }
}

let addbtn=document.getElementById('add');
addbtn.addEventListener('click', function(){
    let popupAdd=document.querySelector('.add-pop');
    if(popupAdd.classList.contains('hide')){
        popupAdd.classList.remove('hide');
    }
    currTags=[];
})

let tagsOpenbtn=document.getElementById('tagsSelect');
let tagsPop=document.querySelector(".tags-select");
let tagsUL=document.getElementById("tagsUL");

let tagsSelectbtn=document.getElementById("tagsselect-sbmt");
let tagsSelectbtnEdt=document.getElementById("tagsselectEdt-sbmt");
let tagsSelectbtnfltr=document.getElementById("tagsselectfltr-sbmt");

function renderTags(){
    tagsUL.innerHTML="";
    let len=tags.length;
    for(let i=0; i<len; i+=1){
        let checkbox=document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.name = "tags-av";
        checkbox.value = tags[i];
        checkbox.id = tags[i]+"-id";

        let label = document.createElement('label');
        label.htmlFor = tags[i]+"-id";
        label.appendChild(document.createTextNode(tags[i]));

        let br1=document.createElement('br');
        let br2=document.createElement('br');

        tagsUL.appendChild(checkbox);
        tagsUL.appendChild(label);
        tagsUL.appendChild(br1);
        tagsUL.appendChild(br2);
    }
}

tagsOpenbtn.addEventListener('click', function(e){
    if(tagsPop.classList.contains('hide')){
        tagsPop.classList.remove("hide");
    }
    if(tagsSelectbtn.classList.contains("hide")){
        tagsSelectbtn.classList.remove("hide");
    }
    if(tagsSelectbtnEdt.classList.contains("hide")==false){
        tagsSelectbtnEdt.classList.add("hide");
    }
    if(tagsSelectbtnfltr.classList.contains("hide")==false){
        tagsSelectbtnfltr.classList.add("hide");
    }
    renderTags();
})

tagsPop.addEventListener('click', function(e){
    if(e.target==tagsPop){
        if(tagsPop.classList.contains('hide')==false){
            tagsPop.classList.add("hide");
        }
    }
})

tagsSelectbtn.addEventListener('click', function(e){
    if(tagsPop.classList.contains('hide')==false){
        tagsPop.classList.add("hide");
    }
    let checkboxes = document.querySelectorAll('input[name="tags-av"]:checked');

    checkboxes.forEach((checkbox) => {
        if(currTags.includes(checkbox.value)==false){
            currTags.push(checkbox.value);
        }
    });
})

let tagsAddbtn=document.getElementById("tagsAdd");
let newTagVal;

tagsAddbtn.addEventListener('click', function(e){
    newTagVal=document.getElementById("myTagsAdd").value;
    document.getElementById("myTagsAdd").value="";

    if(newTagVal!=""){
        if(tags.includes(newTagVal)==false){
            tags.push(newTagVal);
            tagctr++;
            let newTag=new TagObj(tagctr, newTagVal);
            tagObjs.push(newTag);
        }
    }
})

let sbmtbtn=document.getElementById('sbmt');
sbmtbtn.addEventListener('click', function(){
    addEle();
    let popupAdd=document.querySelector('.add-pop');
    if(popupAdd.classList.add("hide")){
        popupAdd.classList.add("hide");
    }
})

let outer=document.querySelector(".add-pop")
outer.addEventListener('click', function(e){
    if(e.target==outer){
        let popupAdd=document.querySelector('.add-pop');
        if(popupAdd.classList.add("hide")){
            popupAdd.classList.add("hide");
        }
    }
}, true)

//Setting alert for a task

let popupalrt=document.querySelector(".alert-pop");
let outeralrt=document.querySelector(".alert-pop");

function setAlert(e){
    let eId=e.target.classList[1];

    if(popupalrt.classList.contains('hide')){
        popupalrt.classList.remove('hide');
        document.getElementById("alrt-sbmt").classList.add(eId.toString());
    }

    outeralrt.addEventListener('click', function(e){
        if(e.target==outeralrt){
            let popupalrt=document.querySelector('.alert-pop');
            if(popupalrt.classList.contains('hide')==false){
                popupalrt.classList.add("hide");
            }
            document.getElementById("alrt-sbmt").classList.remove(eId.toString());
        }
    }, true)
}

let alrtSetBtn=document.getElementById("alrt-sbmt");
alrtSetBtn.addEventListener("click", (e)=>{
    let alrtdate = document.getElementById("alrt-Date").value;
    document.getElementById("alrt-Date").value="";
    let objID=alrtSetBtn.classList[1];
    document.getElementById("alrt-sbmt").classList.remove(objID.toString());
    let idxalrt=arr.findIndex((obj) => obj.key==objID);
    if(alrtdate!=""){
        arr[idxalrt].alertDate=alrtdate;
        addToLog("Alert added for Task with Id " + objID.toString());
    }
    if(popupalrt.classList.contains('hide')==false){
        popupalrt.classList.add("hide");
    }
    renderAll();
})

//Showing subtasks of a task

function showSubtasks(e){
    let eId=e.target.classList[1];

    let popupst=document.querySelector(".stv-pop");
    if(popupst.classList.contains('hide')){
        popupst.classList.remove('hide');
    }

    renderSubtasks(eId);

    let outer=document.querySelector(".stv-pop")
    outer.addEventListener('click', function(e){
        if(e.target==outer){
            let popupst=document.querySelector('.stv-pop');
            if(popupst.classList.contains('hide')==false){
                popupst.classList.add("hide");
            }
        }
    }, true)
}


//Adding a subtask

let steditbtn=document.getElementById("st-sbmt-edit");
let stsbmtbtn=document.getElementById('st-sbmt');
let steId;

function addSubtask(e){
    
    if(steditbtn.classList.contains("hide")==false){
        steditbtn.classList.add("hide");
    }
    
    if(stsbmtbtn.classList.contains("hide")){
        stsbmtbtn.classList.remove("hide");
    }

    steId=e.target.classList[1];

    let popupstadd=document.querySelector(".st-pop");
    if(popupstadd.classList.contains('hide')){
        popupstadd.classList.remove('hide');
    }

    let outer=document.querySelector(".st-pop")
    outer.addEventListener('click', function(e){
        if(e.target==outer){
            let popupstadd=document.querySelector('.st-pop');
            if(popupstadd.classList.contains('hide')==false){
                popupstadd.classList.add("hide");
            }
        }
    }, true)
}

stsbmtbtn.addEventListener('click', function(event){

    let subtask = document.getElementById("stInput").value;
    
    if(subtask!=""){
        addSub(steId, subtask);
    }

    document.getElementById("stInput").value="";

    let popupstadd=document.querySelector(".st-pop");
    if(popupstadd.classList.contains('hide')==false){
        popupstadd.classList.add('hide');
    }
})

//Deleting a task

function delEle(e){
    let eId=e.target.classList[1];
    del(eId);
    addToLog("Task with Id " + eId.toString() + " Deleted");
    renderAll();
}


//Editing a task

let tagsOpenbtnEdt=document.getElementById('tagsSelectEdt');

let edteId, edtindex;
let edtsbmtbtn=document.getElementById('e-sbmt');

function editEle(e){
    edteId=e.target.classList[2];
    // console.log(e.target);
    // console.log(e.target.classList)
    edtindex= arr.findIndex((obj) => obj.key==edteId);

    currTags=[];
    
    let popupEdit=document.querySelector('.edit-pop');
    if(popupEdit.classList.contains('hide')){
        popupEdit.classList.remove('hide');

        let task=document.querySelector("#eInput");
        task.value=arr[edtindex].value;

        let category=document.querySelector("#eCategory");
        category.value=arr[edtindex].category;

        let priority=document.querySelector("#ePriority");
        priority.value=rev_priority_chart[arr[edtindex].priority];

        let dueDate=document.querySelector("#eDate");
        dueDate.value=arr[edtindex].dueDate;
    }

    let outer=document.querySelector(".edit-pop")
    outer.addEventListener('click', function(e){
        if(e.target==outer){
            let popupEdit=document.querySelector('.edit-pop');
            if(popupEdit.classList.contains('hide')==false){
                popupEdit.classList.add("hide");
            }
        }
    }, true)
}

function renderTagsEd(){
    tagsUL.innerHTML="";
    let len=tags.length;
    for(let i=0; i<len; i+=1){
        let checkbox=document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.name = "tags-av-ed";
        checkbox.value = tags[i];
        checkbox.id = tags[i]+"-id";

        let label = document.createElement('label');
        label.htmlFor = tags[i]+"-id";
        label.appendChild(document.createTextNode(tags[i]));

        let br1=document.createElement('br');
        let br2=document.createElement('br');

        tagsUL.appendChild(checkbox);
        tagsUL.appendChild(label);
        tagsUL.appendChild(br1);
        tagsUL.appendChild(br2);
    }
}

tagsOpenbtnEdt.addEventListener('click', function(e){
    if(tagsPop.classList.contains('hide')){
        tagsPop.classList.remove("hide");
    }
    if(tagsSelectbtn.classList.contains("hide")==false){
        tagsSelectbtn.classList.add("hide");
    }
    if(tagsSelectbtnEdt.classList.contains("hide")){
        tagsSelectbtnEdt.classList.remove("hide");
    }
    if(tagsSelectbtnfltr.classList.contains("hide")==false){
        tagsSelectbtnfltr.classList.add("hide");
    }
    renderTagsEd();
})

tagsPop.addEventListener('click', function(e){
    if(e.target==tagsPop){
        if(tagsPop.classList.contains('hide')==false){
            tagsPop.classList.add("hide");
        }
    }
})

tagsSelectbtnEdt.addEventListener('click', function(e){
    if(tagsPop.classList.contains('hide')==false){
        tagsPop.classList.add("hide");
    }
    let checkboxes = document.querySelectorAll('input[name="tags-av-ed"]:checked');

    checkboxes.forEach((checkbox) => {
        if(currTags.includes(checkbox.value)==false){
            currTags.push(checkbox.value);
        }
    });

})

edtsbmtbtn.addEventListener('click', function(){
    let task = document.getElementById("eInput").value;
    let category = document.getElementById("eCategory").value;
    let priority = document.getElementById("ePriority").value;
    let dueDate = document.getElementById("eDate").value;

    document.getElementById("eInput").value="";

    if(task !=""){
        edit(edtindex, task, category, priority, dueDate);

        let taglen=currTags.length;
        let objtemp=arr[edtindex];
        let tOlen=objtemp.tags.length;
        for(let i=0; i<tOlen; i++){
            let tempIdx=tagObjs.findIndex((obj) => obj.key==objtemp.tags[i]);
            // console.log(tagObjs[tempIdx]);
            let toIdx=tagObjs[tempIdx].tasks.findIndex((obj) => obj.key==objtemp.key);
            // console.log(tagObjs[tempIdx].tasks[toIdx]);
            tagObjs[tempIdx].tasks.splice(toIdx,1);
            tagObjs[tempIdx].tasks=tagObjs[tempIdx].tasks.splice(toIdx,1);
        }
        objtemp.tags=[];
        for(let i=0; i<taglen; i++){
            if(objtemp.tags.includes(currTags[i])==false){
                let tagidx=tagObjs.findIndex((obj) => obj.value==currTags[i]);
                objtemp.tags.push(tagObjs[tagidx].key);
                tagObjs[tagidx].tasks.push(objtemp);
            }
        }

        addToLog("Task with Id " + edteId.toString() + " Edited");
    }

    let popupEdit=document.querySelector('.edit-pop');
    if(popupEdit.classList.add("hide")){
        popupEdit.classList.add("hide");
    }

    renderAll();
})


// Editing a subtask

let edtstbtn=document.getElementById("st-sbmt-edit"); 
let edtstsbmtbtn=document.getElementById('st-sbmt');;
let stedtpindex, stedteindex, stedtpId, stedteId;

function stEditEle(e){

    if(edtstbtn.classList.contains("hide")){
        edtstbtn.classList.remove("hide");
    }
    
    if(edtstsbmtbtn.classList.contains("hide")==false){
        edtstsbmtbtn.classList.add("hide");
    }

    stedteId=e.target.classList[2];
    stedtpId=e.target.classList[3];
    if(stedtpId==undefined){
        stedtpId=stedteId;
    }

    stedtpindex = arr.findIndex((obj) => obj.key==stedtpId);
    stedteindex = arr[stedtpindex].subtasks.findIndex((obj) => obj.key==stedteId);

    let popupEdit=document.querySelector('.st-pop');
    if(popupEdit.classList.contains('hide')){
        popupEdit.classList.remove('hide');
        let stip=document.getElementById("stInput");
        stip.value=arr[stedtpindex].subtasks[stedteindex].value;
    }

    let outer=document.querySelector(".st-pop")
    outer.addEventListener('click', function(e){
        if(e.target==outer){
            let popupEdit=document.querySelector('.st-pop');
            if(popupEdit.classList.contains('hide')==false){
                popupEdit.classList.add("hide");
            }
        }
    }, true)
}


edtstbtn.addEventListener('click', function(){

    let subtask = document.getElementById("stInput").value;
    document.getElementById("stInput").value="";

    if(subtask!=""){
        arr[stedtpindex].subtasks[stedteindex].value=subtask;
        addToLog("Subtask with Id " + stedteId.toString() + " of task with ID "+ stedtpId.toString() + " Edited");
    }
    

    let popupEdit=document.querySelector('.st-pop');
    if(popupEdit.classList.add("hide")){
        popupEdit.classList.add("hide");
    }

    renderSubtasks(stedtpId);
})

//Filtering tasks

let filterbtn=document.getElementById("filter");
let unfilterbtn=document.getElementById("unfilter");

function renderTagsFltr(){
    tagsUL.innerHTML="";
    let len=tags.length;
    for(let i=0; i<len; i+=1){
        let checkbox=document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.name = "tags-av-fltr";
        checkbox.value = tags[i];
        checkbox.id = tags[i]+"-id";

        let label = document.createElement('label');
        label.htmlFor = tags[i]+"-id";
        label.appendChild(document.createTextNode(tags[i]));

        let br1=document.createElement('br');
        let br2=document.createElement('br');

        tagsUL.appendChild(checkbox);
        tagsUL.appendChild(label);
        tagsUL.appendChild(br1);
        tagsUL.appendChild(br2);
    }
}

filterbtn.addEventListener('click', function(){
    let popupfilter=document.querySelector('.filter-pop');
    if(popupfilter.classList.contains('hide')){
        popupfilter.classList.remove('hide');
    }

    filterTags=[];
    let sbmtbtn=document.getElementById('f-sbmt');
    let tagsOpenbtnfltr=document.getElementById("tagsSelectfltr");

    tagsOpenbtnfltr.addEventListener('click', function(e){
    
        if(tagsPop.classList.contains('hide')){
            tagsPop.classList.remove("hide");
        }
        if(tagsSelectbtn.classList.contains("hide")==false){
            tagsSelectbtn.classList.add("hide");
        }
        if(tagsSelectbtnEdt.classList.contains("hide")==false){
            tagsSelectbtnEdt.classList.add("hide");
        }
        if(tagsSelectbtnfltr.classList.contains("hide")){
            tagsSelectbtnfltr.classList.remove("hide");
        }
        renderTagsFltr();
    })

    tagsPop.addEventListener('click', function(e){
        if(e.target==tagsPop){
            if(tagsPop.classList.contains('hide')==false){
                tagsPop.classList.add("hide");
            }
        }
    })
    
    tagsSelectbtnfltr.addEventListener('click', function(e){
        if(tagsPop.classList.contains('hide')==false){
            tagsPop.classList.add("hide");
        }
        let checkboxes = document.querySelectorAll('input[name="tags-av-fltr"]:checked');
    
        checkboxes.forEach((checkbox) => {
            if(filterTags.includes(checkbox.value)==false){
                filterTags.push(checkbox.value);
            }
        });
    })

    sbmtbtn.addEventListener('click', function(){
        let category = document.getElementById("fCategory").value;
        let priority = document.getElementById("fPriority").value;
        let sdueDate = document.getElementById("s-fDate").value;
        let edueDate = document.getElementById("e-fDate").value;
        filter(category, priority, sdueDate, edueDate, filterTags);
        if(popupfilter.classList.contains('hide')==false){
            popupfilter.classList.add("hide");
        }
        filterbtn.classList.add("hide");
        unfilterbtn.classList.remove("hide");
    })

    let outer=document.querySelector(".filter-pop")
    outer.addEventListener('click', function(e){
        if(e.target==outer){
            let popupEdit=document.querySelector('.filter-pop');
            if(popupEdit.classList.contains('hide')==false){
                popupEdit.classList.add("hide");
            }
        }
    }, true)
});

unfilterbtn.addEventListener('click', function(){
    renderAll();
    unfilterbtn.classList.add("hide");
    filterbtn.classList.remove("hide");
});


// Showing Backlogs

let bcklgbtn=document.getElementById('bcklog');
let unbcklgbtn=document.getElementById('unbcklog');

bcklgbtn.addEventListener('click', function(){
    let newArray = arr.filter(function (el) {
        let cond=true;
        let dd=new Date(el.dueDate).getTime();
        let td=new Date().getTime();
        cond=cond && (dd<td) && (el.completed==false);
        return cond;
    }
    );
    if(bcklgbtn.classList.contains('hide')==false){
        bcklgbtn.classList.add('hide');
    }
    if(unbcklgbtn.classList.contains('hide')){
        unbcklgbtn.classList.remove("hide");
    }
    renderAll(newArray);
});

unbcklgbtn.addEventListener('click', function(){
    if(unbcklgbtn.classList.contains('hide')==false){
        unbcklgbtn.classList.add('hide');
    }
    if(bcklgbtn.classList.contains('hide')){
        bcklgbtn.classList.remove("hide");
    }
    renderAll();
});


// Sorting Tasks

let sortbtn=document.getElementById("sort");
sortbtn.addEventListener('click', function(e){
    let popupsort=document.querySelector('.sort-pop');
    if(popupsort.classList.contains('hide')){
        popupsort.classList.remove('hide');
    }

    let sbmtbtn=document.getElementById('sort-sbmt');
    sbmtbtn.addEventListener('click', function(){
        let parameter = document.getElementById("parameter").value;
        let order = document.getElementById("order").value;
        sort(parameter, order);
        if(popupsort.classList.contains('hide')==false){
            popupsort.classList.add("hide");
        }
        renderAll(arr);
    })

    let outer=document.querySelector(".sort-pop")
    outer.addEventListener('click', function(e){
        if(e.target==outer){
            let popupEdit=document.querySelector('.sort-pop');
            if(popupEdit.classList.contains('hide')==false){
                popupEdit.classList.add("hide");
            }
        }
    }, true)
});


//Searching Tasks and Subtasks

let searchBtn=document.getElementById('search');
let unsearchBtn=document.getElementById('unsearch');
let searchsbmtbtn=document.getElementById('search-sbmt');
let srchparam, srchterm;
let popupsearch=document.querySelector('.search-pop');

searchBtn.addEventListener('click', function(e){
    
    if(popupsearch.classList.contains('hide')){
        popupsearch.classList.remove('hide');
    }


    let outer=document.querySelector(".search-pop")
    outer.addEventListener('click', function(e){
        if(e.target==outer){
            let popupsearch=document.querySelector('.search-pop');
            if(popupsearch.classList.contains('hide')==false){
                popupsearch.classList.add("hide");
            }
        }
    }, true)
});

searchsbmtbtn.addEventListener('click', function(){
    srchparam = document.getElementById("search-parameter").value;
    srchterm = document.getElementById("term").value;
    document.getElementById("term").value="";

    if(order!=""){
        search(srchparam, srchterm);
    }
    
    if(popupsearch.classList.contains('hide')==false){
        popupsearch.classList.add("hide");
    }

    if(searchBtn.classList.contains("hide")==false){
        searchBtn.classList.add("hide");
    }
    if(unsearchBtn.classList.contains("hide")){
        unsearchBtn.classList.remove("hide");
    }
})

unsearchBtn.addEventListener('click', function(e){
    renderAll();
    if(unsearchBtn.classList.contains("hide")==false){
        unsearchBtn.classList.add("hide");
    }
    if(searchBtn.classList.contains("hide")){
        searchBtn.classList.remove("hide");
    }
});

//Complete or Incomplete task

function changeState(e){
    let eId=e.target.classList[1];
    let index = arr.findIndex((obj) => obj.key==eId);

    if(arr[index].completed){
        arr[index].completed=false;
    }
    else{
        arr[index].completed=true;
    }

    addToLog("Sate of task with Id " + eId.toString() + " changed");
    renderAll();
}

// Complete or incomplete subtask

function stchangeState(e){
    let eId=e.target.classList[1];
    let pId=e.target.classList[2];
    if(pId==undefined){
        pId=eId;
    }
    let index=arr.findIndex((obj) => obj.key==pId);
    let stindex = arr[index].subtasks.findIndex((obj) => obj.key==eId);

    if(arr[index].subtasks[stindex].completed){
        arr[index].subtasks[stindex].completed=false;
    }
    else{
        arr[index].subtasks[stindex].completed=true;
    }

    addToLog("State of Subask with Id " + eId.toString() + " Of Parent with Id " + pId.toString() + " Changed");
    renderSubtasks(pId);
}


//Adding event listner using event bubbling

let ul=document.querySelector("#listUL");

ul.addEventListener('click', function(e){
    if(e.target.classList.contains('litem')){
        editEle(e);
    }
    else if(e.target.classList.contains('lbtn')){
        delEle(e);
    }
    else if(e.target.classList.contains('stbtn')){
        addSubtask(e);
    }
    else if(e.target.classList.contains('stvbtn')){
        showSubtasks(e);
    }
    else if(e.target.classList.contains('alrtbtn')){
        setAlert(e);
    }
    else if(e.target.classList.contains("check")){
        changeState(e);
    }
})


// Enabling drag and drop

function array_move(arr, old_index, new_index) {
    if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;
        while (k--) {
            arr.push(undefined);
        }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr;
};

const initSortableList = (e)=>{
    const draggingItem = ul.querySelector(".dragging");

    const siblings = [...ul.querySelectorAll(".drag-li:not(.dragging)")];

    let nextSibling=siblings.find(sibling =>{
        return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
    })

    ul.insertBefore(draggingItem, nextSibling);

    let index1 = arr.findIndex((obj) => obj.key==Number(draggingItem.classList[1]));
    let index2 = arr.findIndex((obj) => obj.key==Number(nextSibling.classList[1]));

    arr=array_move(arr, index1, index2);
}

ul.addEventListener('dragover', initSortableList);


let stul=document.querySelector("#stul");

stul.addEventListener('click', function(e){
    if(e.target.classList.contains('sublitem')){
        stEditEle(e);
    }
    else if(e.target.classList.contains("check")){
        stchangeState(e);
    }
})


// Activity Log

let albtn=document.getElementById("a-log");
albtn.addEventListener('click', function(e){
    let popupalog=document.querySelector('.alog-pop');
    if(popupalog.classList.contains('hide')){
        popupalog.classList.remove('hide');
    }

    let logs=Object.values(activity_log);
    let alUL=document.getElementById('alul');
    alUL.innerHTML="";
    logs.forEach((e)=>{
        let li=document.createElement('li');
        li.innerText=e;
        alUL.appendChild(li);
    })

    let outer=document.querySelector(".alog-pop")
    outer.addEventListener('click', function(e){
        if(e.target==outer){
            let popupalog=document.querySelector('.alog-pop');
            if(popupalog.classList.contains('hide')==false){
                popupalog.classList.add("hide");
            }
        }
    }, true)
});

setInterval(() => {
    //console.log("Hello");
    localStorage.setItem("arr", JSON.stringify(arr));
    localStorage.setItem("tags", JSON.stringify(tags));
    localStorage.setItem("tagObjs", JSON.stringify(tagObjs));
    localStorage.setItem("ctr", JSON.stringify(ctr));
    localStorage.setItem("tagctr", JSON.stringify(tagctr));
    localStorage.setItem("activity_log", JSON.stringify(activity_log));
}, 2000);

// setInterval(()=>{
//     console.log(tagObjs);
// }, 5000)