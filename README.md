# hipchat-roll-dice [![Build Status](https://travis-ci.org/rdennis/hipchat-roll-dice.svg?branch=master)](https://travis-ci.org/rdennis/hipchat-roll-dice)
A HipChat integration to roll dice.

## Usage
* `/roll` => `rolled [1-6]`
* `/roll #d##` => `rolled ##`
* `/roll #d## .. #d##` => `rolled [sum(##)]`
* `/roll option1 option2 .. optionN` => `rolled [option]`
* `/roll #d## option1 .. optionN` => `rolled ## [option]`

## Examples
* `/roll` => `rolled 3`
* `/roll 1d20` => `rolled 13`
* `/roll 8d10` => `rolled 54`
* `/roll 1d20 1d10` => `rolled 9`
* `/roll dog cat fish pig` => `rolled cat`
* `/roll @user @otherUser @userThree` => `rolled @otherUser`
* `/roll cow chicken duck horse 1d20` => `rolled 13 duck`