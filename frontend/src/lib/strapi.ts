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


export async function submitReservation(formData: object) {
  const response = await fetch(`${STRAPI_URL}/api/food-bank-reservation-forms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${STRAPI_TOKEN}`,
    },
    body: JSON.stringify({ data: formData }),
  });

  if (!response.ok) {
    throw new Error(`Reservation submission failed: ${response.status}`);
  }

  return response.json();
}