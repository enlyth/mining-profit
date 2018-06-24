#  Worldwide Cryptocurrency Mining Profitability
This is a small experiment to show how profitable it is to mine cryptocurrencies with different equipment based on cryptocurrency prices and prices of electricity worldwide.
It is built using Next.js / React.

This was made over the period of a couple of days, so the code is not exemplary, but it does the job to showcase the data.

# Live URL
Currently deployed at:
[https://mining-profit.now.sh/](https://mining-profit.now.sh/)

#  Where does the data come from?
At the moment, I didn't have time to gather, consolidate and validate all the data, so I opted to use some public APIs which provide the information. The site makes fetch requests to the following URLs, client side:

`https://whattomine.com/asic.json`
`https://whattomine.com/coins.json`
`https://www.cryptocompare.com/api/data/miningequipment/`

Unfortunately, this data is not completely accurate, and as a result, some items are duplicated, and some inaccuracies remain.

Electricity prices are far from completely accurate as well, sources and information can be found in `/data/electricity.js`.

#  Why did you make this?
This was made purely as a learning experience, I currently have no active stake or interest in cryptocurrencies.

# License
MIT

# Known issues
Several, including tooltips sometime not displaying. Don't have time to fix this at the moment, and cannot reproduce on localhost. Refresh page to fix.