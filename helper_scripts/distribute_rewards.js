const jwk = `{}`
const arweave = Arweave.init();
const excluded_addresses = ["yjC9CFWNkQ6lGGm3n_gJwAu8c45yBc9e8dazXJWBN9M"];
const reward_list = new Map();



async function usdToAr(usd) {
	
	
	const ar_api = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=arweave&vs_currencies=usd");
	const res = await ar_api.json();
	const price = res["arweave"]["usd"];

	return usd / price

};


async function filterHolders(usd, distribution = usdToAr) {
	
	  const ar_amount = await distribution(usd)
	
      const state = await fetch("https://cache.community.xyz/contract/l4iqeiSb4oJrpByg6rgiXlW1iF3cgjXLbHdG2JvAC_c");

      const contractObj = await state.json();
      
      const balancesObj = contractObj["balances"]

      // exclude fQR weave and known smartWeave addresses
      
      for (holder of excluded_addresses) {

		delete balancesObj[holder] 
	
	}

      let totalHeldFqr =  ( Object.values(balancesObj) ).reduce((a, b) => a + b, 0 )


     for ( let address of Object.keys(balancesObj) ) {


     	let reward =  balancesObj[address] / totalHeldFqr  * ar_amount
     	
     	reward_list.set(address, reward)

     }
    

     return reward_list
};



async function distribute_rewards(usd) {

	const rewards = await filterHolders(usd)

	for ( holder of rewards.entries() ) {

		let transaction = await arweave.createTransaction({
			target: holder[0],
			quantity: arweave.arToWinston( String(holder[1]) )

		});

		transaction.addTag("App-Name", "fQR-Weave");
		transaction.addTag("description", "dividends distribution");
		
		await arweave.transactions.sign(transaction, JSON.parse(jwk));
		await arweave.transactions.post(transaction);

		console.log(transaction)
	}
}


distribute_rewards(usd_integer)




