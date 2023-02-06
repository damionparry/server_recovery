db.inventory.aggregate([
  { "$set":
    { "ansible_facts.ansible_fruits":
      { "$function": {
          "body": "function(ansible_facts) { if (ansible_facts.ansible_fruits) { return ansible_facts.ansible_fruits.sort(); } else { return ['none']; }}",
          "args": ["$ansible_facts"],
          "lang": "js"
      }}
    }
  },
  { "$set":
    { "ansible_facts.ansible_all_ipv4_addresses":
      { "$function": {
          "body": "function(ansible_facts) { if (ansible_facts.ansible_all_ipv4_addresses) { return ansible_facts.ansible_all_ipv4_addresses.sort(); }}",
          "args": ["$ansible_facts"],
          "lang": "js"
      }}
    }
  },
  { "$group": 
    { "_id": { "$reduce": {
		      "input": "$ansible_facts.ansible_fruits",
		      "initialValue": "",
		      "in": { "$concat" : ["$$value", "_", "$$this"] }
		    }
	         }, 
      "servers": {
	      "$push": {
		      "hostname": "$ansible_facts.ansible_hostname",
		      "ipv4_addresses": "$ansible_facts.ansible_all_ipv4_addresses"
	      }
      },	          
      "count": {
        "$sum": 1
      }
    }
  },
//  { "$out": { "db": "example_com", "coll": "personas"}},
  { "$project": {
      "_id": 0,
      "persona": "$_id",
      "count": 1
      }
   }
]).pretty()

