from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.config.logger import get_logger

logger = get_logger("LeadsRouter")

router = APIRouter(
    prefix="/v1/leads",
    tags=["Leads"]
)

# -------------------------------------------------------------------
# Mock Leads Data
# -------------------------------------------------------------------

MOCK_LEADS = [
     {
        "conversation_id": "conv_007",
        "name": "Rohit Sharma",
        "email": "rohit@logistics.in",
        "phone": "+91 9823012345",
        "business_description":
            "Logistics and supply chain services for regional distributors.",
        "status": "Qualified",
    },
    {
        "conversation_id": "conv_008",
        "name": "Pooja Mehta",
        "email": "pooja@fashionstudio.in",
        "phone": "+91 9765432109",
        "business_description":
            "Boutique fashion studio specializing in custom ethnic wear.",
        "status": "Qualified",
    },
    {
        "conversation_id": "conv_009",
        "name": "Sanjay Pawar",
        "email": "sanjay@construction.co",
        "phone": "+91 9898123456",
        "business_description":
            "Civil construction contractor for residential projects.",
        "status": "Unqualified",
    },
    {
        "conversation_id": "conv_010",
        "name": "Anjali Kulkarni",
        "email": "anjali@hrsolutions.in",
        "phone": "+91 9012345678",
        "business_description":
            "HR consulting and recruitment services for SMEs.",
        "status": "Qualified",
    },
    {
        "conversation_id": "conv_011",
        "name": "Vikram Singh",
        "email": "vikram@autoparts.in",
        "phone": "+91 9988771122",
        "business_description":
            "Wholesale supplier of automobile spare parts.",
        "status": "Unqualified",
    },
    {
        "conversation_id": "conv_012",
        "name": "Nidhi Agarwal",
        "email": "nidhi@finconsult.in",
        "phone": "+91 9345612345",
        "business_description":
            "Financial consulting and tax planning services.",
        "status": "Qualified",
    },
    {
        "conversation_id": "conv_013",
        "name": "Prashant Jadhav",
        "email": "prashant@eventcraft.in",
        "phone": "+91 9977554433",
        "business_description":
            "Event management and corporate event planning.",
        "status": "Qualified",
    },
    {
        "conversation_id": "conv_014",
        "name": "Kavita Rao",
        "email": "kavita@wellnesshub.in",
        "phone": "+91 9811223344",
        "business_description":
            "Wellness center offering yoga and therapy sessions.",
        "status": "Qualified",
    },
    {
        "conversation_id": "conv_015",
        "name": "Manoj Yadav",
        "email": "manoj@securityservices.in",
        "phone": "+91 9922334455",
        "business_description":
            "Private security and surveillance services.",
        "status": "Unqualified",
    },
    {
        "conversation_id": "conv_016",
        "name": "Shruti Desai",
        "email": "shruti@interiordesign.in",
        "phone": "+91 9876548899",
        "business_description":
            "Interior design services for residential apartments.",
        "status": "Qualified",
    },
    {
        "conversation_id": "conv_017",
        "name": "Arjun Malhotra",
        "email": "arjun@itservices.in",
        "phone": "+91 9098765432",
        "business_description":
            "IT support and managed services for small businesses.",
        "status": "Qualified",
    },
    {
        "conversation_id": "conv_018",
        "name": "Meenal Joshi",
        "email": "meenal@ngohelp.org",
        "phone": "+91 9812345670",
        "business_description":
            "NGO focused on education and rural development.",
        "status": "Unqualified",
    },
    {
        "conversation_id": "conv_019",
        "name": "Akash Verma",
        "email": "akash@ecommercebrand.in",
        "phone": "+91 9876501234",
        "business_description":
            "D2C e-commerce brand selling health supplements.",
        "status": "Qualified",
    },
    {
        "conversation_id": "conv_020",
        "name": "Sunita Chavan",
        "email": "sunita@foodprocessing.in",
        "phone": "+91 9988123456",
        "business_description":
            "Food processing and packaged snacks manufacturing.",
        "status": "Qualified",
    },
    {
        "conversation_id": "conv_021",
        "name": "Deepak More",
        "email": "deepak@solartech.in",
        "phone": "+91 9765001122",
        "business_description":
            "Solar panel installation and maintenance services.",
        "status": "Qualified",
    },
    {
        "conversation_id": "conv_022",
        "name": "Ritu Bansal",
        "email": "ritu@playschool.in",
        "phone": "+91 9819988776",
        "business_description":
            "Pre-school and early childhood education center.",
        "status": "Qualified",
    },
    {
        "conversation_id": "conv_023",
        "name": "Harish Nair",
        "email": "harish@travelagency.in",
        "phone": "+91 9899001122",
        "business_description":
            "Travel agency specializing in domestic tour packages.",
        "status": "Unqualified",
    },
    {
        "conversation_id": "conv_024",
        "name": "Sonal Shah",
        "email": "sonal@jewelleryhouse.in",
        "phone": "+91 9876123400",
        "business_description":
            "Retail jewellery showroom and custom design services.",
        "status": "Qualified",
    },
    {
        "conversation_id": "conv_025",
        "name": "Imran Sheikh",
        "email": "imran@fleetservices.in",
        "phone": "+91 9900112233",
        "business_description":
            "Fleet management and vehicle leasing services.",
        "status": "Unqualified",
    },
    {
        "conversation_id": "conv_026",
        "name": "Tanvi Patwardhan",
        "email": "tanvi@contentstudio.in",
        "phone": "+91 9887766554",
        "business_description":
            "Content creation and social media management agency.",
        "status": "Qualified",
    },
    {

        "conversation_id": "conv_006",
        "name": "Neha Verma",
        "email": "neha@healthcare.org",
        "phone": "+91 9345678123",
        "business_description":
            "Healthcare consulting and clinic management services.",
        "status": "Qualified",
    },
]

# -------------------------------------------------------------------
# List Leads
# -------------------------------------------------------------------

@router.get(
    "/",
    summary="List leads",
    description="Retrieve all leads (mock data)",
)
async def list_leads(
    status: Optional[str] = Query(default=None)
):
    try:
        if status:
            filtered = [
                lead for lead in MOCK_LEADS
                if lead["status"].lower() == status.lower()
            ]
            logger.info("Fetched filtered leads")
            return {
                "status": "success",
                "data": filtered,
            }

        logger.info("Fetched all leads")
        return {
            "status": "success",
            "data": MOCK_LEADS,
        }

    except Exception as e:
        logger.exception("Error fetching leads")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch leads: {str(e)}",
        )

# -------------------------------------------------------------------
# Get Lead Details
# -------------------------------------------------------------------

@router.get(
    "/{conversation_id}",
    summary="Get lead details",
    description="Retrieve a single lead using conversation_id",
)
async def get_lead_details(conversation_id: str):
    try:
        lead = next(
            (l for l in MOCK_LEADS if l["conversation_id"] == conversation_id),
            None,
        )

        if not lead:
            raise HTTPException(
                status_code=404,
                detail="Lead not found",
            )

        logger.info(f"Fetched lead {conversation_id}")
        return {
            "status": "success",
            "data": lead,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error fetching lead")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch lead {conversation_id}: {str(e)}",
        )
