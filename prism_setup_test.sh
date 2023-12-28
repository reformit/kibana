#!/bin/bash

source prism_setup.sh

# Color codes for output
GREEN='\033[1;32m' # Bold Green
RED='\033[1;31m'   # Bold Red
BLUE='\033[1;34m'  # Bold blue
NC='\033[0m'       # No Color (to reset the text style)

# Function to print colored output for passed tests
print_passed() {
  echo -e "${GREEN}$(tput bold)PASSED${NC}"
}

# Function to print colored output for failed tests
print_failed() {
  echo -e "${RED}$(tput bold)FAILED${NC}"
}

# Function to print bold and underlined text
print_heading() {
  echo -e "${BLUE}$(tput bold)$1${NC}"
}

#####################################################
#    command_exists unit tests
#####################################################
perform_command_exists_tests() {
  print_heading "\nTesting command_exists function:"
  test_when_command_exists
  test_when_command_doesnt_exist
  test_when_command_is_built_in
  test_when_command_exists_has_empty_argument
  test_with_multiple_commands
}

test_when_command_exists() {
  # Positive Test Case: Command Exists
  if command_exists "ls"; then
    echo -e "Test case 1 ls exists $(print_passed)"
  else
    echo -e "Test case 1 ls exists $(print_failed)"
  fi
}

test_when_command_doesnt_exist() {
  # Negative Test Case
  if ! command_exists "nonexistent_command"; then
    echo -e "Test case 2 command does not exist $(print_passed)"
  else
    echo -e "Test case 2 command does not exist $(print_failed)"
  fi
}

test_when_command_is_built_in() {
  # Test for Built-in Command
  if command_exists "cd"; then
    echo -e "Test case 3 build in command cd exists $(print_passed)"
  else
    echo -e "Test case 3 build in command cd exists $(print_failed)"
  fi
}

test_when_command_exists_has_empty_argument() {
  # Test Argument Handling
  if ! command_exists ""; then
    echo -e "Test case 4 command_exists with empty argument $(print_passed)"
  else
    echo -e "Test case 4 command_exists with empty argument $(print_failed)"
  fi
}

test_with_multiple_commands() {
  # Test with multiple commands
  if command_exists "ls" && command_exists "pwd"; then
    echo -e "Test case 5 2 commands (ls and pwd) $(print_passed)"
  else
    echo -e "Test case 5 2 commands (ls and pwd) $(print_failed)"
  fi
}

#####################################################
#    log unit tests
#####################################################
perform_log_tests() {
  print_heading "\nTesting log function:"

  # Test log function with a string
  expected_message="This is a test message"
  logged_message=$(log "$expected_message")
  if [ "$logged_message" = "$expected_message" ]; then
    echo "Test case 1 correct string logged $(print_passed)"
  else
    echo "Test case 1 correct string logged $(print_failed)"
  fi

  # Test log function with an empty string
  expected_empty_message=""
  logged_empty_message=$(log "$expected_empty_message")
  if [ "$logged_empty_message" = "$expected_empty_message" ]; then
    echo "Test case 2 no string logged $(print_passed)"
  else
    echo "Test case 2 no string logged $(print_failed)"
  fi
}

#####################################################
#    log_debug unit tests
#####################################################
perform_log_debug_tests() {
  print_heading "\nTesting log_debug function:"
  test_message_prints
  test_message_doesnt_print
  test_message_debug_false_empty_string
}

test_message_prints() {
  # Check if the message was printed based on DEBUG=true
  logged_debug_true=$(DEBUG=true log_debug "This is a debug message with DEBUG=true")
  if [ -n "$logged_debug_true" ]; then
    echo "Test case 1 (DEBUG=true) shows log $(print_passed)"
  else
    echo "Test case 1 (DEBUG=true) shows log $(print_failed)"
  fi
}

test_message_doesnt_print() {
  # Check if the message was not printed based on DEBUG=false
  logged_debug_false=$(DEBUG=false log_debug "This is a debug message with DEBUG=false")
  if [ -z "$logged_debug_false" ]; then
    echo "Test case 2 (DEBUG=false) doesn't show log $(print_passed)"
  else
    echo "Test case 2 (DEBUG=false) doesn't show log $(print_failed)"
  fi
}

test_message_debug_false_empty_string() {
  # Check empty message when DEBUG=false
  logged_debug_false_empty=$(DEBUG=false log_debug "")
  if [ -z "$logged_debug_false_empty" ]; then
    echo "Test case 3 (DEBUG=false) with empty string doesn't show log $(print_passed)"
  else
    echo "Test case 3 (DEBUG=false) with empty string doesn't show log $(print_failed)"
  fi
}

#####################################################
#    log_finish unit tests
#####################################################
perform_log_finish_tests() {
  print_heading "\nTesting log_finish function:"
  test_print_script_finish_message
}

test_print_script_finish_message() {
  # Capture the output of log_finish function in a variable
  logged_finish_output=$(log_finish)

  # Check if the message was logged by examining the variable content
  if [[ "$logged_finish_output" == *"FINISH Dev Environment Setup"* ]]; then
    echo "Test case 1 log_finish prints script finish message: $(print_passed)"
  else
    echo "Test case 1 log_finish prints script finish message: $(print_failed)"
  fi
}

#####################################################
#    check_nvm_installed unit tests
#####################################################
perform_check_nvm_installed_tests() {
  print_heading "\nTesting check_nvm_installed function:"
  test_nvm_not_installed
  test_nvm_installed
}

test_nvm_not_installed() {
  # Create a temporary directory
  temp_dir=$(mktemp -d)

  # Create a mock .nvm/nvm.sh file in the temporary directory
  mock_nvm_sh="$temp_dir/.nvm/nvm.sh"
  mkdir -p "$(dirname "$mock_nvm_sh")"
  touch "$mock_nvm_sh"

  # Call the function and capture its output
  check_nvm_installed_output=$(HOME="$temp_dir" check_nvm_installed 2>&1)

  # Check if the function output contains expected strings for success
  if [[ "$check_nvm_installed_output" == *"NVM is not installed"* || "$check_nvm_installed_output" == *"Please install NVM"* ]]; then
    echo "Test case 1 NVM not installed: $(print_failed)"
  else
    echo "Test case 1 NVM not installed: $(print_passed)"
  fi

  # Clean up temporary directory
  if [[ "$temp_dir" != "" && "$temp_dir" != "/" ]]; then
    rm -rf "$temp_dir"
  else
    echo "Invalid directory path. Aborting deletion."
  fi
}

test_nvm_installed() {
  # Test when NVM is installed
  temp_dir2=$(mktemp -d)
  mock_nvm_sh="$temp_dir2/.nvm/nvm.sh"
  mkdir -p "$(dirname "$mock_nvm_sh")"
  touch "$mock_nvm_sh"

  # Call the function and capture its output
  check_nvm_installed_output=$(HOME="$temp_dir2" check_nvm_installed 2>&1)

  # Check if the function output contains expected strings for success
  if [[ "$check_nvm_installed_output" == *"NVM is not installed"* || "$check_nvm_installed_output" == *"Please install NVM"* ]]; then
    echo "Test case 2 NVM installed: $(print_failed)"
  else
    echo "Test case 2 NVM installed: $(print_passed)"
  fi

  # Clean up temporary directory
  if [[ "$temp_dir2" != "" && "$temp_dir2" != "/" ]]; then
    rm -rf "$temp_dir2"
  else
    echo "Invalid directory path. Aborting deletion."
  fi
}

#####################################################
#    handle_incorrect_node_version unit tests
#####################################################
perform_handle_incorrect_node_version_tests() {
  print_heading "\nTesting handle_incorrect_node_version function:"

  # Initialize variables to track function calls
  called_nvm_use=false
  called_nvm_install=false

  # Function to simulate nvm list output
  call_nvm_list() {
    echo "       v10.23.1
       v10.23.2
       v10.23.3
       v10.24.0
       v10.24.1
      v12.22.12
       v14.21.3
       v15.14.0
       v16.13.2
       v16.18.0
        v18.0.0
       v18.16.0
       v18.18.2
        v19.1.0
        v19.2.0
        v19.3.0
        v19.4.0
default -> 18.16.0 (-> v18.16.0)
iojs -> N/A (default)
unstable -> N/A (default)
node -> stable (-> v19.4.0) (default)
stable -> 19.4 (-> v19.4.0) (default)
lts/* -> lts/iron (-> N/A)
lts/argon -> v4.9.1 (-> N/A)
lts/boron -> v6.17.1 (-> N/A)
lts/carbon -> v8.17.0 (-> N/A)
lts/dubnium -> v10.24.1
lts/erbium -> v12.22.12
lts/fermium -> v14.21.3
lts/gallium -> v16.20.2 (-> N/A)
lts/hydrogen -> v18.19.0 (-> N/A)
lts/iron -> v20.10.0 (-> N/A)"
  }

  call_nvm_use() {
    called_nvm_use=true
  }

  call_nvm_install() {
    called_nvm_install=true
  }

  test_required_nvm_version_in_list
  test_required_nvm_version_not_in_list
}

test_required_nvm_version_in_list() {
  # Test with a version that exists in nvm list
  required_version="v18.16.0"
  handle_incorrect_node_version "$required_version"
  if $called_nvm_use && ! $called_nvm_install; then
    echo "Test case 1 version in nvm list calls use: $(print_passed)"
  else
    echo "Test case 1 version in nvm list calls use: $(print_failed)"
  fi
}

test_required_nvm_version_not_in_list() {
  # Reset variables
  called_nvm_use=false
  called_nvm_install=false

  # Test with a version that doesn't exist in nvm list
  required_version="v20.10.1"
  handle_incorrect_node_version "$required_version"
  if ! $called_nvm_use && $called_nvm_install; then
    echo "Test case 2 version not in nvm list calls install: $(print_passed)"
  else
    echo "Test case 2 version not in nvm list calls install: $(print_failed)"
  fi
}

#####################################################
#    check_node_installation unit tests
#####################################################
perform_check_node_installation_tests() {
  print_heading "\nTesting check_node_installation function:"

  # Initialize variables to track function calls
  called_handle_incorrect_node_version=false
  called_check_nvm_installed=false

  # Mock function for handle_incorrect_node_version
  handle_incorrect_node_version() {
    called_handle_incorrect_node_version=true
  }

  check_nvm_installed() {
    called_check_nvm_installed=true
  }

  DEBUG=false

  test_incorrect_node_version
  test_correct_node_version
}

test_incorrect_node_version() {
  node_version="10.23.1"
  required_node_version="10.23.3"

  check_node_installation

  if $called_handle_incorrect_node_version; then
    echo "Test case 1 wrong node version, should call handle_incorrect_node_version: $(print_passed)"
  else
    echo "Test case 1 wrong node version, should call handle_incorrect_node_version: $(print_failed)"
  fi

  #Reset for other tests
  called_handle_incorrect_node_version=false

}

test_correct_node_version() {
  node_version="10.23.1"
  required_node_version="10.23.1"

  check_node_installation

  if ! $called_handle_incorrect_node_version; then
    echo "Test case 2 correct node version, shouldn't call handle_incorrect_node_version: $(print_passed)"
  else
    echo "Test case 2 correct node version, shouldn't call handle_incorrect_node_version: $(print_failed)"
  fi
}

#####################################################
#    verify_yarn_version unit tests
#####################################################
perform_verify_yarn_version_tests() {
  print_heading "\nTesting verify_yarn_version function:"

  called_install_yarn=false

  install_yarn() {
    called_install_yarn=true
  }

  DEBUG=false

  test_install_called_when_versions_dont_match
  test_install__notcalled_when_versions_match
}

test_install_called_when_versions_dont_match() {
  required_yarn_version="1.22.21"
  installed_yarn_version="1.22.22"

  verify_yarn_version

  if $called_install_yarn; then
    echo "Test case 1 yarn versions mismatch, should call install_yarn: $(print_passed)"
  else
    echo "Test case 1 yarn versions mismatch, should call install_yarn: $(print_failed)"
  fi

  # Reset test
  called_verify_yarn_version=false
  called_install_yarn=false
}

test_install__notcalled_when_versions_match() {
  required_yarn_version="1.22.21"
  installed_yarn_version="1.22.21"

  verify_yarn_version

  if ! $called_install_yarn; then
    echo "Test case 2 yarn versions match, should not call install_yarn: $(print_passed)"
  else
    echo "Test case 2 yarn versions match, should not call install_yarn: $(print_failed)"
  fi

  # Reset test
  called_verify_yarn_version=false
  called_install_yarn=false
}

#####################################################
#    check_yarn_installation unit tests
#####################################################
perform_check_yarn_installation_tests() {
  print_heading "\nTesting check_yarn_installation function:"

  called_verify_yarn_version=false
  called_install_yarn=false

  verify_yarn_version() {
    called_verify_yarn_version=true
  }

  install_yarn() {
    called_install_yarn=true
  }

  DEBUG=false

  test_yarn_not_installed_should_call_install
  test_yarn_not_installed_shouldnt_call_verify
  test_yarn_installed_shouldnt_call_install
  test_yarn_installed_should_call_verify

}

test_yarn_not_installed_should_call_install() {
  command_exists() {
    return 1
  }

  check_yarn_installation

  if $called_install_yarn; then
    echo "Test case 1 yarn command doesn't exist, should call install_yarn: $(print_passed)"
  else
    echo "Test case 1 yarn command doesn't exist, should call install_yarn: $(print_failed)"
  fi

  # Reset test
  called_verify_yarn_version=false
  called_install_yarn=false

}

test_yarn_not_installed_shouldnt_call_verify() {
  command_exists() {
    return 1
  }

  check_yarn_installation

  if ! $called_verify_yarn_version; then
    echo "Test case 2 yarn command doesn't exist, should not call verify_yarn_version: $(print_passed)"
  else
    echo "Test case 2 yarn command doesn't exist, should not call verify_yarn_version: $(print_failed)"
  fi

  # Reset test
  called_verify_yarn_version=false
  called_install_yarn=false
}

test_yarn_installed_shouldnt_call_install() {
  command_exists() {
    return 0
  }

  check_yarn_installation

  if ! $called_install_yarn; then
    echo "Test case 3 yarn command does exist, shouldn't call install_yarn: $(print_passed)"
  else
    echo "Test case 3 yarn command does exist, shouldn't call install_yarn: $(print_failed)"
  fi

  # Reset test
  called_verify_yarn_version=false
  called_install_yarn=false

}

test_yarn_installed_should_call_verify() {
  command_exists() {
    return 0
  }

  check_yarn_installation

  if $called_verify_yarn_version; then
    echo "Test case 4 yarn command does exist, should call verify_yarn_version: $(print_passed)"
  else
    echo "Test case 4 yarn command does exist, should call verify_yarn_version: $(print_failed)"
  fi

  # Reset test
  called_verify_yarn_version=false
  called_install_yarn=false
}

perform_build_prism_docker_image_tests() {

  print_heading "\nTesting build_prism_docker_image function:"

  called_handle_docker_does_not_exist=false
  called_run_docker_image_build=false

  handle_docker_does_not_exist() {
    called_handle_docker_does_not_exist=true
  }

  run_docker_image_build() {
    called_run_docker_image_build=true
  }

  DEBUG=false

  test_docker_not_installed_calls_handle
  test_docker_not_installed_doesnt_call_run_docker_image_build
  test_docker_installed_calls_run_docker_image_build
  test_docker_installed_doesnt_call_handle_docker_does_not_exist

}

test_docker_not_installed_calls_handle() {
  command_exists() {
    return 1
  }

  build_prism_docker_image

  if $called_handle_docker_does_not_exist; then
    echo "Test case 1 docker not instlled, should call handle_docker_does_not_exist: $(print_passed)"
  else
    echo "Test case 1 docker not instlled, should call handle_docker_does_not_exist: $(print_failed)"
  fi

  called_handle_docker_does_not_exist=false
  called_run_docker_image_build=false

}

test_docker_not_installed_doesnt_call_run_docker_image_build() {
  command_exists() {
    return 1
  }

  build_prism_docker_image

  if ! $called_run_docker_image_build; then
    echo "Test case 2 docker not instlled, should not call run_docker_image_build: $(print_passed)"
  else
    echo "Test case 2 docker not instlled, should not call run_docker_image_build: $(print_failed)"
  fi

  called_handle_docker_does_not_exist=false
  called_run_docker_image_build=false

}

test_docker_installed_calls_run_docker_image_build() {
  command_exists() {
    return 0
  }

  build_prism_docker_image

  if $called_run_docker_image_build; then
    echo "Test case 3 docker installed, should call run_docker_image_build: $(print_passed)"
  else
    echo "Test case 3 docker installed, should call run_docker_image_build: $(print_failed)"
  fi

  called_handle_docker_does_not_exist=false
  called_run_docker_image_build=false

}

test_docker_installed_doesnt_call_handle_docker_does_not_exist() {
  command_exists() {
    return 0
  }

  build_prism_docker_image

  if ! $called_handle_docker_does_not_exist; then
    echo "Test case 2 docker instlled, should call run_docker_image_build: $(print_passed)"
  else
    echo "Test case 2 docker instlled, should call run_docker_image_build: $(print_failed)"
  fi

  called_handle_docker_does_not_exist=false
  called_run_docker_image_build=false

}

#####################################################
#    Main Test Execution
#####################################################
perform_command_exists_tests
perform_log_tests
perform_log_debug_tests
perform_log_finish_tests
perform_check_nvm_installed_tests
perform_handle_incorrect_node_version_tests
perform_verify_yarn_version_tests
perform_check_node_installation_tests
perform_check_yarn_installation_tests
perform_build_prism_docker_image_tests

echo -e "\n"
