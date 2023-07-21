let arr=[];
let ctr=0;

class Obj{
    constructor(key, value){
        this.key=key;
        this.value=value;
    }
}


function add(key1, value){
    let obj=new Obj(key1, value);
    arr.push(obj);
}

function del(id){
    const index = arr.findIndex((obj) => obj.key==id);
    // console.log(index);
    arr.splice(index, 1);
}


// Rendering elements of the array

function render(obj1){
    let ul=document.querySelector('#listUL');
    let li=document.createElement('li');
    let div_outer=document.createElement('div');
    let div_inner=document.createElement('div');
    let div_btn=document.createElement('div');

    div_btn.innerText='Delete';
    div_btn.classList.add('lbtn');
    let ctr=obj1.key;
    div_btn.classList.add(ctr.toString());

    div_inner.innerText=obj1.value;
    div_inner.classList.add('litem');
    div_inner.classList.add(ctr.toString());


    div_outer.appendChild(div_inner);
    div_outer.appendChild(div_btn);
    div_outer.classList.add('list-item-div');

    li.appendChild(div_outer);

    ul.appendChild(li);
}

function renderAll(){
    let ul=document.querySelector('#listUL');
    ul.innerHTML=""
    let len=arr.length;
    for(i=len-1; i>=0; i--){
        render(arr[i]);
    }
}


//fetching using API

fetch('https://jsonplaceholder.typicode.com/todos')
.then((response) => {
    if (!response.ok) {
        throw new Error('Network response was not OK');
    }
    return response.json();
})
.then((data) => {
    // Process the received data
    //console.log(data);
    let n=data.length;
    for(let i=0; i<n; i++){
        let obj=data[i];
        ctr+=1;
        add(ctr, obj.title);
    }

    renderAll();
})
.catch(error => {
    // Handle any errors that occurred during the fetch request
    console.log('Error:', error.message);
});


//Adding a task

function addEle(){
    let inputValue = document.getElementById("myInput").value;
    document.getElementById("myInput").value = "";

    ctr+=1;

    add(ctr, inputValue);
    renderAll();
}

let addbtn=document.getElementById('add');
addbtn.addEventListener('click', function(){
    addEle();
    // console.log(arr);
})

//Deleting a task

function delEle(e){
    let eId=e.target.classList[1];
    del(eId);
    renderAll();
}


//Editing a task

function editEle(e){
    let eId=e.target.classList[1];

    const index = arr.findIndex((obj) => obj.key==eId);
    
    let input = document.createElement("input");
    input.setAttribute("type", "text");
    input.classList.add("input");
    input.value=arr[index].value + "    <Press Enter to save edit>";

    let par=e.target.parentNode
    par.innerHTML="";
    par.appendChild(input);

    input.addEventListener("keyup", function(event) {
        if (event.key === "Enter") {
            let cont=input.value;
            arr[index].value=cont;
            renderAll();
        }
    })
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
    // console.log(arr);
})