// Script to seed the database with sample startup data
// Run with: node seed-startups.js

const { createClient } = require('@supabase/supabase-js')

// You'll need to set these environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const sampleStartups = [
  {
    name: "Unrivaled",
    description: "Sports technology platform connecting athletes and fans",
    industry: "Sports Technology",
    location: "San Francisco, CA",
    founded_date: "2020-01-01",
    website_url: "https://unrivaled.com",
    funding_rounds: [
      {
        round_type: "series_b",
        amount_raised: 25000000, // $25M in cents
        currency: "USD",
        date: "2025-09-08",
        source_url: "https://techcrunch.com/unrivaled-series-b",
        investors: [
          "Bessemer Venture Partners",
          "Serena Ventures", 
          "Warner Bros Discovery",
          "Trybe Ventures"
        ]
      }
    ]
  },
  {
    name: "The Clearing Company",
    description: "Blockchain infrastructure for financial services",
    industry: "Fintech",
    location: "New York, NY",
    founded_date: "2021-03-15",
    website_url: "https://clearing.com",
    funding_rounds: [
      {
        round_type: "seed",
        amount_raised: 15000000, // $15M in cents
        currency: "USD", 
        date: "2025-09-01",
        source_url: "https://venturebeat.com/clearing-seed",
        investors: [
          "Union Square Ventures",
          "Haun Ventures",
          "Variant",
          "Coinbase Ventures",
          "Compound",
          "Rubik",
          "Earl Grey",
          "Cursor Capital",
          "Asylum"
        ]
      }
    ]
  },
  {
    name: "Appcharge",
    description: "Mobile gaming monetization platform",
    industry: "Gaming",
    location: "Tel Aviv, Israel",
    founded_date: "2019-06-01",
    website_url: "https://appcharge.com",
    funding_rounds: [
      {
        round_type: "series_b",
        amount_raised: 58000000, // $58M in cents
        currency: "USD",
        date: "2025-08-13",
        source_url: "https://gamesindustry.biz/appcharge-series-b",
        investors: [
          "IVP",
          "Playrix",
          "Creandum",
          "Play Ventures",
          "Glilot Capital Partners",
          "Smilegate Investment",
          "Moneta VC",
          "Bitkraft Ventures",
          "Corundum"
        ]
      }
    ]
  },
  {
    name: "Qloud Games",
    description: "Cloud gaming infrastructure and platform",
    industry: "Gaming",
    location: "Austin, TX",
    founded_date: "2022-01-01",
    website_url: "https://qloudgames.com",
    funding_rounds: [
      {
        round_type: "series_a",
        amount_raised: 5000000, // $5M in cents
        currency: "USD",
        date: "2025-08-13",
        source_url: "https://venturebeat.com/qloud-series-a",
        investors: [
          "Bitkraft Ventures",
          "GFR Fund",
          "Speedrun (a16z)",
          "1UP Fund",
          "Gaingels"
        ]
      }
    ]
  },
  {
    name: "Jump",
    description: "Athletic performance analytics platform",
    industry: "Sports Technology",
    location: "Los Angeles, CA",
    founded_date: "2021-09-01",
    website_url: "https://jump.tech",
    funding_rounds: [
      {
        round_type: "series_a",
        amount_raised: 23000000, // $23M in cents
        currency: "USD",
        date: "2025-08-12",
        source_url: "https://sportstech.com/jump-series-a",
        investors: [
          "Seven Seven Six (Alexis Ohanian)",
          "Courtside Ventures",
          "Will Ventures",
          "Forerunner Ventures",
          "Steve Malik"
        ]
      }
    ]
  },
  {
    name: "Novig",
    description: "AI-powered gaming analytics and insights",
    industry: "Gaming",
    location: "Seattle, WA",
    founded_date: "2020-05-01",
    website_url: "https://novig.ai",
    funding_rounds: [
      {
        round_type: "series_a",
        amount_raised: 18000000, // $18M in cents
        currency: "USD",
        date: "2025-08-11",
        source_url: "https://techcrunch.com/novig-series-a",
        investors: [
          "Forerunner Ventures",
          "Y Combinator",
          "NFX",
          "Perceptive Ventures",
          "Gaingels",
          "Joe Montana"
        ]
      }
    ]
  },
  {
    name: "TeamLinkt",
    description: "Team collaboration and project management platform",
    industry: "SaaS",
    location: "Chicago, IL",
    founded_date: "2022-03-01",
    website_url: "https://teamlinkt.com",
    funding_rounds: [
      {
        round_type: "series_a",
        amount_raised: 6000000, // $6M in cents
        currency: "USD",
        date: "2025-08-08",
        source_url: "https://venturebeat.com/teamlinkt-series-a",
        investors: [
          "Growth Street Partners"
        ]
      }
    ]
  }
]

async function seedStartups() {
  console.log('Starting to seed startups...')
  
  for (const startupData of sampleStartups) {
    try {
      console.log(`Adding ${startupData.name}...`)
      
      // Create startup
      const { data: startup, error: startupError } = await supabase
        .from('startups')
        .insert({
          name: startupData.name,
          description: startupData.description,
          industry: startupData.industry,
          location: startupData.location,
          founded_date: startupData.founded_date,
          website_url: startupData.website_url
        })
        .select()
        .single()

      if (startupError) {
        console.error(`Error creating startup ${startupData.name}:`, startupError)
        continue
      }

      // Create funding rounds and investors
      for (const roundData of startupData.funding_rounds) {
        // Create funding round
        const { data: fundingRound, error: fundingError } = await supabase
          .from('funding_rounds')
          .insert({
            startup_id: startup.id,
            round_type: roundData.round_type,
            amount_raised: roundData.amount_raised,
            currency: roundData.currency,
            date: roundData.date,
            source_url: roundData.source_url
          })
          .select()
          .single()

        if (fundingError) {
          console.error(`Error creating funding round for ${startupData.name}:`, fundingError)
          continue
        }

        // Create investors and link them to funding round
        for (const investorName of roundData.investors) {
          // Check if investor exists
          let { data: existingInvestor } = await supabase
            .from('investors')
            .select('id')
            .eq('name', investorName)
            .single()

          // Create investor if doesn't exist
          if (!existingInvestor) {
            const { data: newInvestor, error: investorError } = await supabase
              .from('investors')
              .insert({
                name: investorName,
                type: 'vc_firm' // Default type
              })
              .select()
              .single()

            if (investorError) {
              console.error(`Error creating investor ${investorName}:`, investorError)
              continue
            }
            existingInvestor = newInvestor
          }

          // Link investor to funding round
          const { error: linkError } = await supabase
            .from('funding_round_investors')
            .insert({
              funding_round_id: fundingRound.id,
              investor_id: existingInvestor.id,
              is_lead: false
            })

          if (linkError) {
            console.error(`Error linking investor ${investorName} to funding round:`, linkError)
          }
        }
      }

      console.log(`✅ Successfully added ${startupData.name}`)
    } catch (error) {
      console.error(`Error processing ${startupData.name}:`, error)
    }
  }
  
  console.log('✅ Finished seeding startups!')
}

seedStartups().catch(console.error)
