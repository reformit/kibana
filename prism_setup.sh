#!/bin/bash

#####################################################
# Dev Environment Setup Script for PRISM
#
# This script automates the setup of the development environment for the PRISM project.
# It includes checks and installations for Node.js, Yarn, and Docker, ensuring the required
# versions are available for the development workflow.
#
# Functions:
# - Check and manage Node.js setup using nvm
# - Verify and manage Yarn setup with a specific version
# - Bootstrap the PRISM development environment
# - Build the Docker image if Docker is installed
#
# Usage:
# - Execute the script to initialize the development environment for PRISM.
# - Pass 'debug' as the first argument to enable debug mode.
# - Pass 'build' as the second argument to trigger the Docker image build process.
#
# NOTE: Ensure the necessary tools like nvm, Node.js, Yarn, and Docker are pre-installed
#       or follow the provided links for installation instructions.
#
# Usage Example:
# $ ./prism_setup.sh debug build
#
#####################################################

#####################################################
#    General Functions for the Script
#####################################################

test_function() {
  echo "test_function called with parameter = $1"
}

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

log() {
  echo -e "$1"
}

log_debug() {
  $DEBUG && log "$1"
}

log_debug_start() {
  log_debug "\n**********************************************"
  log_debug "$1"
  log_debug "**********************************************"
}

log_finish() {
  log "\nFINISH Dev Environment Setup"
}

#####################################################
#    Checks the nvm Setup
#####################################################
check_nvm_installed() {
  if [ ! -s "$HOME/.nvm/nvm.sh" ]; then
    log_error "NVM is not installed or the installation directory is not found."
    log_error "Please install NVM and try running the script again."
    log_error "See: https://www.freecodecamp.org/news/node-version-manager-nvm-install-guide/"
    exit 1
  fi
}

handle_incorrect_node_version() {
  local required_version=$1
  if call_nvm_list | grep -q "$required_version"; then
    call_nvm_use "$required_version"
  else
    call_nvm_install "$required_version"
  fi
}

call_nvm_list() {
  nvm list
}

call_nvm_use() {
  nvm use "$1"
}

call_nvm_install() {
  nvm install "$1"
}

required_node_version="10.23.1"
node_version=$(node -v | cut -c 2-) # Get Node.js version without the 'v' prefix

check_node_installation() {
  log_debug_start "Confirming that Node.js is set up correctly"

  check_nvm_installed

  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # Load NVM

  if [[ "$node_version" != "$required_node_version" ]]; then
    handle_incorrect_node_version "$required_node_version"
  else
    log_debug "Node.js version $required_node_version is already installed."
  fi
}

#####################################################
#    Checks the yarn Setup
#####################################################
required_yarn_version="1.22.21"
installed_yarn_version=$(yarn --version)

check_yarn_installation() {
  log_debug_start "Confirm that yarn is set up correctly"

  if ! command_exists yarn; then
    install_yarn "$required_yarn_version"
  else
    verify_yarn_version "$required_yarn_version"
  fi
}

verify_yarn_version() {
  if [[ "$installed_yarn_version" != "$required_yarn_version" ]]; then
    install_yarn "$required_yarn_version"
  fi
}

install_yarn() {
  local yarn_version=$1
  log "Yarn is not installed or an incorrect version is present. Installing Yarn v$required_yarn_version..."
  npm install -g "yarn@$required_yarn_version" || {
    log_error "Failed to install Yarn. Please check your network connection or try again later."
    exit 1
  }
}

#####################################################
#    Bootstraps the PRISM Dev Environment
#####################################################
bootstrap_dev() {
  log_debug_start "Bootstrapping the Dev Environment"
  yarn kbn bootstrap
}

#####################################################
#    Builds the docker image
#####################################################
build_prism_docker_image() {
  log_debug_start "Building Docker Image"

  if ! command_exists docker; then
    handle_docker_does_not_exist
  else
    run_docker_image_build
  fi
}

handle_docker_does_not_exist() {
  log "Docker is not installed. Please install Docker and try again."
  exit 1
}

run_docker_image_build() {
  yarn build --docker --no-oss --skip-docker-ubi
}

# Check if the script is being sourced
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then

  #####################################################
  #    This is the Man Execution Thread of the Script
  #####################################################
  DEBUG=false
  BUILD_IMAGE=false

  [[ "$1" == "debug" ]] && DEBUG=true
  [[ "$2" == "build" ]] && BUILD_IMAGE=true

  main() {
    check_node_installation
    check_yarn_installation
    bootstrap_dev
    $BUILD_IMAGE && build_prism_docker_image
  }

  trap log_finish EXIT

  # Main script
  log "START Dev Environment Setup\n"
  main

else
  # If sourced, do not execute the script content
  echo -e "\nThe script (${BASH_SOURCE[0]}) was not executed as it is being sourced for unit testing."
fi
