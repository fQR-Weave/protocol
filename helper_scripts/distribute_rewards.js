const jwk = `{}`
const excluded_addresses = ["yjC9CFWNkQ6lGGm3n_gJwAu8c45yBc9e8dazXJWBN9M"];
const reward_list = new Map();


let rewards;

async function rewardsAmount() {
	const fee_collector_balance = 
		 await arweave.wallets.getBalance("BbODAb919DcZjX-50a2dzR1EvLK8zbGpr47bQikGCm4")

		 console.log(fee_collector_balance)

	rewards = fee_collector_balance / 2

	return rewards


};




async function filterHolders() {
	
	  const winston_amount = await rewardsAmount();

	
      const state = await fetch("https://cache.community.xyz/contract/l4iqeiSb4oJrpByg6rgiXlW1iF3cgjXLbHdG2JvAC_c");

      const contractObj = await state.json();
      
      const balancesObj = contractObj["balances"]

      // exclude fQR weave and known smartWeave addresses
      
      for (holder of excluded_addresses) {

		delete balancesObj[holder] 
	
	}

      let totalHeldFqr =  ( Object.values(balancesObj) ).reduce((a, b) => a + b, 0 )


     for ( let address of Object.keys(balancesObj) ) {


     	let reward =  balancesObj[address] / totalHeldFqr  * winston_amount
     	
     	reward_list.set(address, reward)

     }
    
     return reward_list
     
};



async function distribute_rewards() {

	const rewards = await filterHolders()

	for ( holder of rewards.entries() ) {

		let transaction = await arweave.createTransaction({
			target: holder[0],
			quantity: holder[1]

		});

		transaction.addTag("App-Name", "fQR-Weave");
		transaction.addTag("action", "dividends");
		transaction.addTag("message", "Thank you for being a holder!")
		
		await arweave.transactions.sign(transaction, JSON.parse(jwk));
		await arweave.transactions.post(transaction);

		console.log(transaction)
	}
}


distribute_rewards()
