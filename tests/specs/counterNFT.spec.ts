import { expect, use } from 'chai'
import { MethodCallOptions } from 'scrypt-ts'
import { CounterNFT } from '../contracts/counterNFT'
import { getDefaultSigner } from '../utils/txHelper'
import chaiAsPromised from 'chai-as-promised'
use(chaiAsPromised)

describe('Test SmartContract `CounterNFT`', () => {
    let instance: CounterNFT

    before(async () => {
        CounterNFT.loadArtifact()
        instance = new CounterNFT(1n)
        await instance.connect(getDefaultSigner())

        await instance.mintTextNft('hello, world!')
    })

    it('should pass the public method unit test successfully.', async () => {
        let currentInstance = instance

        // call the method of current instance to apply the updates on chain
        for (let i = 0; i < 3; ++i) {
            // create the next instance from the current
            const nextInstance = currentInstance.next()

            // apply updates on the next instance off chain
            nextInstance.incCounter()

            // call the method of current instance to apply the updates on chain
            const callContract = async () => {
                const { tx: callTx } = await currentInstance.methods.incOnchain(
                    {
                        transfer: nextInstance,
                    } as MethodCallOptions<CounterNFT>
                )

                console.log('Contract CounterNFT called: ', callTx.id)
            }

            await expect(callContract()).not.rejected

            // update the current instance reference
            currentInstance = nextInstance
        }
    })
})
