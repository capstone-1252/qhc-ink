//you can expose this because its got read only permissions

const STRAPI_URL = import.meta.env.PUBLIC_STRAPI_URL;


async function fetchStrapi(endpoint: string) {
  const response = await fetch(`${STRAPI_URL}/api${endpoint}`);
   //NO calling the Strapi.t
  if (!response.ok) {
    throw new Error(`Strapi error: ${response.status} on ${endpoint}`);
  }

  return response.json();
}


//content-types/api::food-bank-time-slot.food-bank-time-slot
export async function getFoodBankTimeSlots() {
  const data = await fetchStrapi('/food-bank-time-slots?sort=order:asc');
  return data.data;
}

export async function getMenuItems() {
  const data = await fetchStrapi('/menu-items?populate=');
  return data.data;
}

export async function getMenuCategories() {
  const data = await fetchStrapi('/menu-categories?populate=');
  return data.data;
}

export async function getFaqs() {
  const data = await fetchStrapi('/faqs?sort=order:asc');
  return data.data;
}

export async function getHours() {
  const data = await fetchStrapi('/hours');
  return data.data;
}

export async function getFoodBankDinnerDate() {
  const data = await fetchStrapi('/food-bank-dinner-date');
  return data.data;
}

