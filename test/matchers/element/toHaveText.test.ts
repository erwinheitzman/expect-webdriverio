import { $, $$ } from '@wdio/globals'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { getExpectMessage, getReceived, getExpected } from '../../__fixtures__/utils.js'
import { toHaveText } from '../../../src/matchers/element/toHaveText.js'

vi.mock('@wdio/globals')

describe('toHaveText', () => {
    describe('when receiving an element array', () => {
        let els: any

        beforeEach(async () => {
            els = await $$('parent')
            const el1: any = await $('sel')
            el1._text = function (): string {
                return 'WebdriverIO'
            }
            const el2: any = await $('dev')
            el2._text = function (): string {
                return 'Get Started'
            }
            els[0] = el1
            els[1] = el2
        })

        test('should return true if the received element array matches the expected text array', async () => {
            const result = await toHaveText.bind({})(els, ['WebdriverIO', 'Get Started'])
            expect(result.pass).toBe(true)
        })

        test('should return true if the received element array matches the expected text array & ignoreCase', async () => {
            const result = await toHaveText.bind({})(els, ['webdriverio', 'get started'], { ignoreCase: true })
            expect(result.pass).toBe(true)
        })

        test('should return false if the received element array does not match the expected text array', async () => {
            const result = await toHaveText.bind({})(els, ['webdriverio', 'get started'])
            expect(result.pass).toBe(false)
        })

        test('should return true if the expected message shows correctly', async () => {
            const result = await toHaveText.bind({})(els, ['webdriverio', 'get started'], { message: 'Test' })
            expect(getExpectMessage(result.message())).toContain('Test')
        })
    })

    test('wait for success', async () => {
        const el: any = await $('sel')
        el._attempts = 2
        el._text = function (): string {
            if (this._attempts > 0) {
                this._attempts--
                return ''
            }
            return 'webdriverio'
        }

        const beforeAssertion = vi.fn()
        const afterAssertion = vi.fn()
        const result = await toHaveText.call({}, el, 'WebdriverIO', { ignoreCase: true, beforeAssertion, afterAssertion })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(0)
        expect(beforeAssertion).toBeCalledWith({
            matcherName: 'toHaveText',
            expectedValue: 'WebdriverIO',
            options: { ignoreCase: true, beforeAssertion, afterAssertion }
        })
        expect(afterAssertion).toBeCalledWith({
            matcherName: 'toHaveText',
            expectedValue: 'WebdriverIO',
            options: { ignoreCase: true, beforeAssertion, afterAssertion },
            result
        })
    })

    test('wait but failure', async () => {
        const el: any = await $('sel')
        el._text = function (): string {
            throw new Error('some error')
        }

        await expect(() => toHaveText.call({}, el, 'WebdriverIO', { ignoreCase: true }))
            .rejects.toThrow('some error')
    })

    test('success on the first attempt', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._text = function (): string {
            this._attempts++
            return 'WebdriverIO'
        }

        const result = await toHaveText.call({}, el, 'WebdriverIO', { ignoreCase: true })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('no wait - failure', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._text = function (): string {
            this._attempts++
            return 'webdriverio'
        }

        const result = await toHaveText.call({}, el, 'WebdriverIO', { wait: 0 })
        expect(result.pass).toBe(false)
        expect(el._attempts).toBe(1)
    })

    test('no wait - success', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._text = function (): string {
            this._attempts++
            return 'WebdriverIO'
        }

        const result = await toHaveText.call({}, el, 'WebdriverIO', { wait: 0 })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('not - failure', async () => {
        const el: any = await $('sel')
        el._text = function (): string {
            return 'WebdriverIO'
        }
        const result = await toHaveText.call({ isNot: true }, el, 'WebdriverIO', { wait: 0 })
        const received = getReceived(result.message())

        expect(received).not.toContain('not')
        expect(result.pass).toBe(true)
    })

    test('should return false if texts don\'t match', async () => {
        const el: any = await $('sel')
        el._text = function (): string {
            return 'WebdriverIO'
        }

        const result = await toHaveText.bind({ isNot: true })(el, 'foobar', { wait: 1 })
        expect(result.pass).toBe(false)
    })

    test('should return true if texts match', async () => {
        const el: any = await $('sel')
        el._text = function (): string {
            return 'WebdriverIO'
        }

        const result = await toHaveText.bind({ isNot: true })(el, 'WebdriverIO', { wait: 1 })
        expect(result.pass).toBe(true)
    })

    test('should return true if actual text + single replacer matches the expected text', async () => {
        const el: any = await $('sel')
        el._text = function (): string {
            return 'WebdriverIO'
        }

        const result = await toHaveText.bind({})(el, 'BrowserdriverIO', { replace: ['Web', 'Browser'] })
        expect(result.pass).toBe(true)
    })

    test('should return true if actual text + replace (string) matches the expected text', async () => {
        const el: any = await $('sel')
        el._text = function (): string {
            return 'WebdriverIO'
        }

        const result = await toHaveText.bind({})(el, 'BrowserdriverIO', { replace: [['Web', 'Browser']] })
        expect(result.pass).toBe(true)
    })

    test('should return true if actual text + replace (regex) matches the expected text', async () => {
        const el: any = await $('sel')
        el._text = function (): string {
            return 'WebdriverIO'
        }

        const result = await toHaveText.bind({})(el, 'BrowserdriverIO', { replace: [[/Web/, 'Browser']] })
        expect(result.pass).toBe(true)
    })

    test('should return true if actual text starts with expected text', async () => {
        const el: any = await $('sel')
        el._text = function (): string {
            return 'WebdriverIO'
        }

        const result = await toHaveText.bind({})(el, 'Web', { atStart: true })
        expect(result.pass).toBe(true)
    })

    test('should return true if actual text ends with expected text', async () => {
        const el: any = await $('sel')
        el._text = function (): string {
            return 'WebdriverIO'
        }

        const result = await toHaveText.bind({})(el, 'IO', { atEnd: true })
        expect(result.pass).toBe(true)
    })

    test('should return true if actual text contains the expected text at the given index', async () => {
        const el: any = await $('sel')
        el._text = function (): string {
            return 'WebdriverIO'
        }

        const result = await toHaveText.bind({})(el, 'iverIO', { atIndex: 5 })
        expect(result.pass).toBe(true)
    })

    test('message', async () => {
        const el: any = await $('sel')
        el._text = function (): string {
            return ''
        }
        const result = await toHaveText.call({}, el, 'WebdriverIO')
        expect(getExpectMessage(result.message())).toContain('to have text')
    })

    test('success if array matches with text and ignoreCase', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._text = function (): string {
            this._attempts++
            return 'WebdriverIO'
        }

        const result = await toHaveText.call({}, el, ['WDIO', 'Webdriverio'], { ignoreCase: true })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('success if array matches with text and trim', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._text = function (): string {
            this._attempts++
            return '   WebdriverIO   '
        }

        const result = await toHaveText.call({}, el, ['WDIO', 'WebdriverIO', 'toto'], { trim: true })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('success if array matches with text and replace (string)', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._text = function (): string {
            this._attempts++
            return 'WebdriverIO'
        }

        const result = await toHaveText.call({}, el, ['WDIO', 'BrowserdriverIO', 'toto'], { replace: [['Web', 'Browser']] })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('success if array matches with text and replace (regex)', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._text = function (): string {
            this._attempts++
            return 'WebdriverIO'
        }

        const result = await toHaveText.call({}, el, ['WDIO', 'BrowserdriverIO', 'toto'], { replace: [[/Web/g, 'Browser']] })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('success if array matches with text and multiple replacers and one of the replacers is a function', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._text = function (): string {
            this._attempts++
            return 'WebdriverIO'
        }

        const result = await toHaveText.call({}, el, ['WDIO', 'browserdriverio', 'toto'], {
            replace: [
                [/Web/g, 'Browser'],
                [/[A-Z]/g, (match: string) => match.toLowerCase()],
            ],
        })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('failure if array does not match with text', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._text = function (): string {
            this._attempts++
            return 'WebdriverIO'
        }

        const result = await toHaveText.call({}, el, ['WDIO', 'Webdriverio'], { wait: 1 })
        expect(result.pass).toBe(false)
        expect(el._attempts).toBe(1)
    })

    test('should return true if actual text contains the expected text', async () => {
        const el: any = await $('sel')
        el._text = function (): string {
            return 'WebdriverIO'
        }

        const result = await toHaveText.bind({})(el, expect.stringContaining('iverIO'), {})
        expect(result.pass).toBe(true)
    })

    test('should return false if actual text does not contain the expected text', async () => {
        const el: any = await $('sel')
        el._text = function (): string {
            return 'WebdriverIO'
        }

        const result = await toHaveText.bind({})(el, expect.stringContaining('WDIO'), {})
        expect(result.pass).toBe(false)
    })

    test('should return true if actual text contains one of the expected texts', async () => {
        const el: any = await $('sel')
        el._text = function (): string {
            return 'WebdriverIO'
        }

        const result = await toHaveText.bind({})(el, [expect.stringContaining('iverIO'), expect.stringContaining('WDIO')], {})
        expect(result.pass).toBe(true)
    })

    test('should return false if actual text does not contain the expected texts', async () => {
        const el: any = await $('sel')
        el._text = function (): string {
            return 'WebdriverIO'
        }

        const result = await toHaveText.bind({})(el, [expect.stringContaining('EXAMPLE'), expect.stringContaining('WDIO')], {})
        expect(result.pass).toBe(false)
    })

    describe('with RegExp', () => {
        let el: any

        beforeEach(async () => {
            el = await $('sel')
            el._text = vi.fn().mockImplementation(() => {
                return 'This is example text'
            })
        })

        test('success if match', async () => {
            const result = await toHaveText.call({}, el, /ExAmplE/i)
            expect(result.pass).toBe(true)
        })

        test('success if array matches with RegExp', async () => {
            const result = await toHaveText.call({}, el, ['WDIO', /ExAmPlE/i])
            expect(result.pass).toBe(true)
        })

        test('success if array matches with text', async () => {
            const result = await toHaveText.call({}, el, ['This is example text', /Webdriver/i])
            expect(result.pass).toBe(true)
        })

        test('success if array matches with text and ignoreCase', async () => {
            const result = await toHaveText.call({}, el, ['ThIs Is ExAmPlE tExT', /Webdriver/i], {
                ignoreCase: true,
            })
            expect(result.pass).toBe(true)
        })

        test('failure if no match', async () => {
            const result = await toHaveText.call({}, el, /Webdriver/i)
            expect(result.pass).toBe(false)
            expect(getExpectMessage(result.message())).toContain('to have text')
            expect(getExpected(result.message())).toContain('/Webdriver/i')
            expect(getReceived(result.message())).toContain('This is example text')
        })

        test('failure if array does not match with text', async () => {
            const result = await toHaveText.call({}, el, ['WDIO', /Webdriver/i])
            expect(result.pass).toBe(false)
            expect(getExpectMessage(result.message())).toContain('to have text')
            expect(getExpected(result.message())).toContain('/Webdriver/i')
            expect(getExpected(result.message())).toContain('WDIO')
        })
    })
})
