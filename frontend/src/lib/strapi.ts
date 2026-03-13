const STRAPI_URL = import.meta.env.STRAPI_URL;
const STRAPI_TOKEN = import.meta.env.STRAPI_TOKEN;

async function fetchStrapi(endpoint: string) {
  const response = await fetch(`${STRAPI_URL}/api${endpoint}`, {
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Strapi error: ${response.status} on ${endpoint}`);
  }

  return response.json();
}


//content-types/api::food-bank-time-slot.food-bank-time-slot
export async function getFoodBankTimeSlots() {
  const data = await fetchStrapi('/food-bank-time-slots?populate=');
  return data.data;
}

export async function getArticle(slug: string) {
  const data = await fetchStrapi(`/articles?filters[slug][$eq]=${slug}&populate=`);
  return data.data[0];
}

export async function getCategories() {
  const data = await fetchStrapi('/categories?populate=');
  return data.data;
}

export async function getAuthors() {
  const data = await fetchStrapi('/authors?populate=');
  return data.data;
}

export async function getGlobal() {
  const data = await fetchStrapi('/global?populate=*');
  return data.data;
} 
