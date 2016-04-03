var diceRoller = require('./lib/dice-roller');
var pad = require('pad');

runTests(
    [
        undefined,
        '',
        '1d1',
        '1d20',
        '2d20',
        '1d20 1d10',
        '2d20 10d2',
        '@user',
        '@user @user1',
        '@user @user1 @user2 @user3',
        '@user 1d20',
        '1d20 @user',
        '1d1 @user @user1',
        '@user 1d20 @user1',
        '1d20 @user @user1',
        '1d20 @user 1d10 @user1',
        'test test1',
        'test_1_2_3 this_is_a_test',
        'test-1-2-3 this-is-a-test',
        '1d20 @user test_1_2_3 this-is-a-test',
        'test test 1d20',
        'test test1 2d1'
    ], true
);

function runTests(strs, runTestParseMessage) {
    for (var i = 0, l = strs.length; i < l; i++) {
        var str = strs[i];

        if (runTestParseMessage) {
            testParseMessage(str);
        }

        testRollDice(str);
        console.log();
    }
}

function testParseMessage(str) {
    console.log('================== testParseMessage ==================');
    console.log('str: "' + str + '"');
    try {
        var dice = diceRoller.prototype.parseMessage(str);
        console.log('number of dice: ' + dice.length);
        console.log('dice:');
        for (var i = 0, l = dice.length; i < l; i++) {
            console.log('   faces: [' + dice[i].faces + ']');
            console.log('   roll:  ' + dice[i].roll());
        }
    } catch (e) {
        console.log('ERROR: ' + e);
    }
}

function testRollDice(str) {
    console.log('================== testRollDice ==================');
    console.log('str: "' + str + '"');
    try {
        var result = diceRoller.prototype.rollDice(str);
        console.log('result:');
        console.log('   dice:');
        result.dice.forEach(function(die, i) {
            console.log('      ' + pad(result.dice.length.toString().length + 1, (i + 1 + ':')) + ' [' + die.faces + ']');
        });
        console.log('   rolls: [' + result.rolls + ']');
        console.log('   result:');
        console.log('      str: ' + result.result.str);
        console.log('      dice: ' + result.result.dice);
    } catch (e) {
        console.log('ERROR: ' + e);
    }
}