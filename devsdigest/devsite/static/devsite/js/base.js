var console_input = document.getElementsByClassName("console-input")[0];

console_input.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    console_Command(console_input.text());
  }
});

function console_Command(command) {
  var primary_command = command.split(" ")[0];

  switch (primary_command) {
    case "cd": {

    }
    case "pwd": {

    }
    case "whoami": {

    }
    case "sudo": {

    }
    case "help": {
      
    }
  }
}
