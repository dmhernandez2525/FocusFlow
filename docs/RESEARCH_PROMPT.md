# FocusFlow Market Research Prompt

Use this prompt with a research agent or AI assistant to conduct comprehensive market research for FocusFlow's product development.

---

## Research Agent Prompt

```
You are a market research analyst specializing in small business software, ERP systems, and industry-specific management tools. Conduct comprehensive research on the following topics to inform product development for FocusFlow, an ERP platform targeting small-to-medium service businesses.

## Research Objectives

### 1. Small Business ERP Solutions Analysis

Research and analyze the current landscape of ERP solutions for small businesses:

**Key Questions:**
- What are the top 10 ERP solutions for businesses with 1-50 employees?
- What is the average price point for small business ERP software?
- What features do small businesses prioritize most in ERP systems?
- What are the common complaints about existing ERP solutions?
- How do small businesses typically discover and evaluate ERP software?
- What is the average implementation time for small business ERPs?
- What percentage of small businesses use ERP vs. disconnected tools?

**Specific Products to Analyze:**
- Odoo (Community and Enterprise)
- ERPNext
- Zoho One / Zoho Inventory
- QuickBooks Enterprise
- Sage 50
- Acumatica
- NetSuite (lower tiers)
- SAP Business One

**For Each Product, Document:**
- Pricing model and tiers
- Core features included
- Industry focus (if any)
- User reviews summary (G2, Capterra, TrustRadius)
- Common praise and criticism
- Integration ecosystem
- Mobile capabilities
- Implementation requirements

---

### 2. Tattoo and Piercing Shop Management Software

Research software specifically designed for tattoo studios, piercing shops, and body modification businesses:

**Key Questions:**
- What software do tattoo/piercing shops currently use for management?
- What are the must-have features for a tattoo shop management system?
- How do artists typically handle bookings, deposits, and payments?
- What compliance/health regulation tracking do shops need?
- How important is portfolio/image management for artists?
- What CRM features do shops need for client aftercare?
- How do multi-artist studios handle revenue splitting and commissions?

**Industry-Specific Requirements to Research:**
- Appointment booking with deposit collection
- Waiver and consent form management
- Age verification and ID logging
- Health department compliance tracking
- Artist portfolio management
- Flash art inventory and pricing
- Jewelry/merchandise inventory for piercing shops
- Aftercare instruction delivery
- Client tattoo history and placement tracking
- Gift card and loyalty programs

**Competitors to Analyze:**
- REV23
- TattooPro
- Ink Scheduling
- SimpleSalon (used by some shops)
- Square for Retail/Appointments (popular choice)
- Vagaro (salon/spa crossover)

**Industry Statistics to Find:**
- Number of tattoo shops in the US/globally
- Average shop revenue
- Common shop sizes (single artist vs. multi-artist)
- Technology adoption rates
- Pain points with current solutions

---

### 3. Must-Have Features for Retail/Service Businesses

Research the essential features that small retail and service businesses need:

**Retail Business Requirements:**
- Point of sale functionality
- Inventory management essentials
- Customer management basics
- Payment processing needs
- Reporting requirements
- Employee management
- Multi-location needs

**Service Business Requirements:**
- Appointment scheduling
- Service catalog management
- Staff scheduling and assignment
- Time tracking and billing
- Customer communication
- Mobile access needs
- Field service requirements (if applicable)

**Hybrid Business Requirements (Retail + Service):**
- Unified customer view
- Combined inventory and service booking
- Package/bundle offerings
- Membership and subscription models
- Cross-selling opportunities

**Research Questions:**
- What features do small businesses say they can't live without?
- What features do they pay for but rarely use?
- What integrations are considered essential?
- How important is mobile access for owners vs. employees?
- What reporting do small business owners actually look at?

---

### 4. Pain Points with Existing ERP/POS Systems

Research the frustrations and challenges businesses face with current solutions:

**Categories of Pain Points to Research:**

**Implementation & Setup:**
- Time to get started
- Data migration difficulties
- Training requirements
- Hidden setup costs

**Usability:**
- Learning curve issues
- UI/UX complaints
- Mobile app limitations
- Speed and performance issues

**Features:**
- Missing functionality
- Feature bloat (too many unused features)
- Customization limitations
- Integration gaps

**Pricing:**
- Unexpected costs
- Per-user pricing frustrations
- Transaction fees
- Module/feature gating

**Support:**
- Customer service quality
- Documentation quality
- Community resources
- Implementation partner availability

**Technical:**
- Reliability and downtime
- Data security concerns
- Vendor lock-in fears
- API limitations

**Sources to Research:**
- Reddit threads (r/smallbusiness, r/entrepreneur, r/tattoos)
- G2 and Capterra negative reviews
- Quora discussions
- Industry forums
- Facebook groups for small business owners
- Twitter/X complaints
- YouTube review videos

---

## Research Output Format

Please provide research findings in the following format:

### Executive Summary
- Key findings (bullet points)
- Market opportunity assessment
- Recommended focus areas

### Detailed Findings by Topic

#### 1. ERP Landscape Analysis
- Market overview
- Competitor matrix
- Feature comparison table
- Pricing comparison
- User sentiment analysis

#### 2. Tattoo/Piercing Shop Industry
- Industry overview
- Current software usage
- Feature requirements
- Competitor analysis
- Market opportunity

#### 3. Essential Features Analysis
- Must-have features (ranked)
- Nice-to-have features
- Feature gaps in market
- Integration priorities

#### 4. Pain Point Summary
- Top 10 pain points
- Severity and frequency assessment
- Opportunity to differentiate

### Recommendations
- Feature prioritization suggestions
- Pricing model recommendations
- Go-to-market strategy ideas
- Partnership opportunities

### Data Sources
- List all sources consulted
- Note data freshness
- Highlight any data gaps

---

## Additional Context

FocusFlow is built on:
- TurboRepo monorepo architecture
- Next.js 15 frontend
- Fastify payment service
- PostgreSQL database
- Stripe payment processing

Current target: Originally photographers, expanding to general service businesses with special focus on tattoo/piercing shops.

Competitive advantages to leverage:
- Modern, fast user interface
- Cloud-native architecture
- Mobile-first design
- Multi-tenant security
- Affordable pricing model
- Developer-friendly API

---

## Research Timeline

This research should be conducted with data from:
- Industry reports from 2024-2026
- User reviews from the past 12 months
- Pricing data current as of research date
- Regulatory information current for target markets

Please flag any findings that may be outdated or require verification.
```

---

## How to Use This Prompt

### With Claude or GPT-4

1. Copy the entire prompt above
2. Paste into a new conversation
3. Allow the AI to conduct web searches if available
4. Request follow-up on specific areas of interest
5. Ask for source citations where possible

### With Perplexity or Research Tools

1. Break the prompt into smaller sections
2. Run each section as a separate search
3. Compile findings into a unified document
4. Cross-reference findings between sources

### With Human Researchers

1. Use the prompt as a research brief
2. Assign sections to different team members
3. Set a 2-week research timeline
4. Schedule findings review meeting
5. Prioritize primary research (interviews, surveys)

---

## Follow-Up Research Prompts

### Competitive Deep Dive

```
Conduct a detailed competitive analysis of [COMPETITOR NAME] for FocusFlow:

1. Product walkthrough and feature inventory
2. Pricing analysis at all tiers
3. Customer review sentiment analysis (50+ reviews)
4. Integration ecosystem mapping
5. Marketing positioning and messaging
6. Target customer profile
7. Strengths to learn from
8. Weaknesses to exploit
9. Market share and growth trajectory
10. Recent product updates and roadmap (if available)
```

### Customer Interview Questions

```
Generate a customer interview script for tattoo shop owners:

1. Current software stack and tools used
2. Daily workflow pain points
3. Time spent on administrative tasks
4. Payment processing frustrations
5. Customer management challenges
6. Booking and scheduling needs
7. Inventory management (jewelry, supplies)
8. Reporting and business insights needs
9. Budget for software tools
10. Decision-making process for new tools
11. Must-have features vs nice-to-have
12. Experience with previous software switches
```

### Feature Validation

```
Evaluate the following feature for FocusFlow:

Feature: [FEATURE NAME]
Description: [BRIEF DESCRIPTION]

Research and answer:
1. Do competitors offer this feature?
2. What do users say about this feature in reviews?
3. Is this a must-have or nice-to-have?
4. What is the typical implementation approach?
5. Are there any regulatory considerations?
6. What integrations would enhance this feature?
7. What is the estimated development complexity?
8. How would this impact our competitive positioning?
```

### Market Sizing

```
Estimate the market size for FocusFlow:

1. Total Addressable Market (TAM)
   - Small businesses (1-50 employees) in target industries
   - Service businesses requiring scheduling
   - Retail businesses requiring inventory

2. Serviceable Addressable Market (SAM)
   - Businesses likely to adopt cloud software
   - Businesses with sufficient budget
   - Businesses in English-speaking markets

3. Serviceable Obtainable Market (SOM)
   - Realistic capture in Years 1-3
   - Based on competitive landscape
   - Based on go-to-market capabilities

Include data sources and assumptions for all estimates.
```

---

## Research Data Organization

Create the following files based on research findings:

```
docs/research/
├── competitive-analysis.md
├── market-sizing.md
├── customer-personas.md
├── feature-prioritization.md
├── pricing-analysis.md
├── integration-requirements.md
└── industry-reports/
    ├── erp-landscape-2026.md
    ├── tattoo-industry-analysis.md
    └── smb-software-trends.md
```

---

*Document Version: 1.0*
*Last Updated: January 2026*
