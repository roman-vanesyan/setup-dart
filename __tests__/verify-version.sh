#!/usr/bin/env bash

function main()
{
  local version="$(dart --version 2>&1)"
  echo "Found Dart VM version '$version'"
  if [ -z "$(echo $version | grep --fixed-strings v$1)" ]; then
    echo "Unexpected version"
    exit 1
  fi
}

main
unset -f main
