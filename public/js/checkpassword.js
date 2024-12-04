document.querySelector("#form1").addEventListener("submit",validA);

function validA(event){
    let pass1 = document.querySelector("input[name=password]").value;
    let pass2 = document.querySelector("input[name=pass2]").value;

    let isValid = true;
    if(pass1!=pass2){
        alert("passwords dont match")
        isValid = false;
    }
    if(pass1.length<4){
        alert("passwords must be at least 4 characters")
        isValid = false;
    }
    if(!isValid){
        event.preventDefault();
    }
}