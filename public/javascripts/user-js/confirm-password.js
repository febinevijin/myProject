

$('#confirmPassword').submit(function(e){
   
        if ($('#Password').val() == $('#password').val()) 
        {
          $('#message').html('Matching').css('color', 'green');
        } else 
            e.preventDefault()
          $('#message').html('Not Matching').css('color', 'red');

          
    
})