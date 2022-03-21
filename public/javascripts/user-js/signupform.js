$("#name_error_message").hide()
// $("#lname_error_message").hide()
$("#email_error_message").hide()
$("#mob_error_message").hide()
$("#password_error_message").hide()
// $("#confirmpassword_error_message").hide()


var error_name = false;
// var error_lname = false;
var error_email = false;
var error_mobno = false;
var error_password = false;
var error_confirmpassword = false;
$("#form_name").focusout(function () {
  check_name();
});
// $("#form_sname").focusout(function () {
//   check_sname();
// });
$("#form_email").focusout(function () {
  check_email();
});
$("#form_mob").focusout(function () {
  check_mob();
});
$("#form_password").focusout(function () {
  check_password();
});
// $("#form_retype_password").focusout(function () {
//   check_retype_password();
// });

function check_name() {
  var pattern = /^[a-zA-Z]*$/;
  var name = $("#form_name").val();
  if (pattern.test(name) && name !== '') {
    $("#name_error_message").hide();
    $("#form_name").css("border-bottom", "2px solid #34F458");
  } else {
    $("#name_error_message").html("Should contain only Characters");
    $("#name_error_message").show();
    $("#form_name").css("border-bottom", "2px solid #F90A0A");
    error_name = true;
  }
}

// function check_sname() {
//   var pattern = /^[a-zA-Z]*$/;
//   var sname = $("#form_sname").val()
//   if (pattern.test(sname) && sname !== '') {
//     $("#sname_error_message").hide();
//     $("#form_sname").css("border-bottom", "2px solid #34F458");
//   } else {
//     $("#sname_error_message").html("Should contain only Characters");
//     $("#sname_error_message").show();
//     $("#form_sname").css("border-bottom", "2px solid #F90A0A");
//     error_sname = true;
//   }
// }

function check_password() {
  var password_length = $("#form_password").val().length;
  if (password_length < 4) {
    $("#password_error_message").html("Atleast 4 Characters");
    $("#password_error_message").show();
    $("#form_password").css("border-bottom", "2px solid #F90A0A");
    error_password = true;
  } else {
    $("#password_error_message").hide();
    $("#form_password").css("border-bottom", "2px solid #34F458");
  }
}

// function check_retype_password() {
//   var password = $("#form_password").val();
//   var retype_password = $("#form_retype_password").val();
//   if (password !== retype_password) {
//     $("#retype_password_error_message").html("Passwords Did not Matched");
//     $("#retype_password_error_message").show();
//     $("#form_retype_password").css("border-bottom", "2px solid #F90A0A");
//     error_retype_password = true;
//   } else {
//     $("#retype_password_error_message").hide();
//     $("#form_retype_password").css("border-bottom", "2px solid #34F458");
//   }
// }

function check_email() {
  var pattern = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  var email = $("#form_email").val();
  if (pattern.test(email) && email !== '') {
    $("#email_error_message").hide();
    $("#form_email").css("border-bottom", "2px solid #34F458");
  } else {
    $("#email_error_message").html("Invalid Email");
    $("#email_error_message").show();
    $("#form_email").css("border-bottom", "2px solid #F90A0A");
    error_email = true;
  }
}
function check_mob() {
  var pattern = /([0-9]{10})|(\([0-9]{3}\)\s+[0-9]{3}\-[0-9]{4})/;
  var mob = $("#form_mob").val();
  if (pattern.test(mob) && mob !== '' && mob.length == 10) {
    $("#mob_error_message").hide();
    $("#form_mob").css("border-bottom", "2px solid #34F458");
  } else {
    $("#mob_error_message").html("Invalid Mobile NO");
    $("#mob_error_message").show();
    $("#form_mob").css("border-bottom", "2px solid #F90A0A");
    error_mobno = true;
  }
}

$("#registration_form").submit(function () {
  error_name = false; 
//   error_sname = false;
  error_email = false; 
  error_mobno = false;
  error_password = false;
//   error_retype_password = false;

  check_name();
//   check_sname();
  check_email();
  check_mob();
  check_password();
//   check_retype_password();

  if (error_name === false  && error_email === false && error_password === false  && error_mobno === false) {

    return true;
  } else {
    alert("Please Fill the form Correctly");
    return false;
  }


});