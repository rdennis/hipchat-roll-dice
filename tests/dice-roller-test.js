var vows = require('vows');
var assert = require('assert');
var util = require('util');
var DiceRoller = require('../lib/dice-roller');

vows.describe('dice-roller')
    .addBatch({
        'A DiceRoller': {
            topic: new DiceRoller(),
            'should respond to `rollDice`': function(roller) {
                assert.isFunction(roller.rollDice);
            },
            'should respond to `rollDice` with input:': {
                'undefined': respondsWith({
                    dice: [
                        [1, 2, 3, 4, 5, 6]
                    ],
                    result: {
                        str: false,
                        dice: true
                    }
                }, undefined),
                'null': respondsWith({
                    dice: [
                        [1, 2, 3, 4, 5, 6]
                    ],
                    result: {
                        str: false,
                        dice: true
                    }
                }, null),
                '': respondsWith({
                    dice: [
                        [1, 2, 3, 4, 5, 6]
                    ],
                    result: {
                        str: false,
                        dice: true
                    }
                }),
                '1d20': respondsWith({
                    dice: [
                        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
                    ],
                    result: {
                        str: false,
                        dice: true
                    }
                }),
                '2d10': respondsWith({
                    dice: [
                        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                    ],
                    result: {
                        str: false,
                        dice: true
                    }
                }),
                'cow chichen pig': respondsWith({
                    dice: [
                        ['cow', 'chichen', 'pig']
                    ],
                    result: {
                        str: true,
                        dice: false
                    }
                }),
                '1d10 cow chichen pig': respondsWith({
                    dice: [
                        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                        ['cow', 'chichen', 'pig']
                    ],
                    result: {
                        str: true,
                        dice: true
                    }
                }),
                'cow chichen pig 1d10 1d20': respondsWith({
                    dice: [
                        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
                        ['cow', 'chichen', 'pig']
                    ],
                    result: {
                        str: true,
                        dice: true
                    }
                })
            }
        }
    })
    .export(module);

/**************************************************/
/********************* Macros *********************/
/**************************************************/
function respondsWith(resultTemplate, testMessage) {
    var usePassedMessage = arguments.length > 1;

    var context = {
        topic: function(topic) { return topic; }
    };

    context['an object'] = function(topic) {
        assert.isObject(topic);
    };

    context['with ' + (resultTemplate.dice.length) + ' valid dice'] = function(topic) {
        assert.isArray(topic.dice);
        assert.lengthOf(topic.dice, resultTemplate.dice.length);
        for (var i = 0, l = resultTemplate.dice.length; i < l; i++) {
            var actual = topic.dice[i],
                expected = resultTemplate.dice[i];

            assert.deepEqual(actual.faces, expected);
        }
    };

    context['with ' + (resultTemplate.dice.length) + ' valid rolls'] = function(topic) {
        assert.isArray(topic.rolls);
        assert.lengthOf(topic.rolls, resultTemplate.dice.length);

        for (var i = 0, l = resultTemplate.dice.length; i < l; i++) {
            var actual = topic.rolls[i],
                expected = resultTemplate.dice[i];

            assert.include(expected, actual);
        }
    };

    context['with ' + (resultTemplate.result.str ? 'a valid' : 'no') + ' str result'] = function(topic) {
        if (resultTemplate.result.str) {
            var strRolls = topic.rolls.reduce(function(str, curr) {
                if (util.isString(curr)) {
                    return (str + ' ' + curr).trim();
                }
            }, '');
        } else {
            assert.isNull(topic.result.str);
        }
    };

    context['with ' + (resultTemplate.result.dice ? 'a valid' : 'no') + ' dice result'] = function(topic) {
        if (!!resultTemplate.result.dice) {
            var expected = topic.rolls.reduce(function(total, curr) {
                if (util.isNumber(curr)) {
                    return total + curr;
                }
            }, 0);
        } else {
            assert.isNull(topic.result.dice);
        }
    };

    return {
        topic: function(roller) {
            var message = usePassedMessage ? testMessage : this.context.name;
            var topic = roller.rollDice(message);
            return topic;
        },
        'should return': context
    };;
}
