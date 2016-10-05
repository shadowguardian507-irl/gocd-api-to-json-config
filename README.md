# gocd-api-to-json-config

Tool for extracting pipeline config from GO Continuous Delivery servers and converting it to the [JSON Config format](https://github.com/tomzo/gocd-json-config-plugin).

## Installation

`npm i -g gocd-api-to-json-config`

Create .go-credentials configuration file in either your user's home directory, or the Current Working Directory where you wish to save the config files to.

`{
  "username": "my-username",
  "password: "my-password"
}`

The go user credentials will require API access to function correctly.

## Usage

Navigate to where you want to save the config files.

`goconfig -h mygoserver.com:8153 -p Existing.Pipeline`

## Options

    -h, --help                 output usage information
    -V, --version              output the version number
    -p, --pipeline <pipeline>  GO Pipeline to retrieve from the API
    -h, --host <host>          GO Server host
    -o, --output [output]      Output filename


