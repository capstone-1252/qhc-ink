import * as Accordion from '@radix-ui/react-accordion';

const faqs = [
  {
    id: 'faq-1',
    question: 'How does the vegan foodbank fundraiser work?',
    answer: `Foodbank reservations take place on select dates with limited seating. The dates are regularly updated on the website. There is a $5 reservation fee purely to ensure commitment in donating to the charity!\n\nA foodbank fundraiser reservation is separate from regular reservations. Book your foodbank seating @here!`
  },
  {
    id: 'faq-2',
    question: 'How does the Menu work?',
    answer: 'Our menu changes constantly! The menu listed on our website is to give you a general idea of what we might offer at Little Wolf.'
  },
  {
    id: 'faq-3',
    question: 'How do I make a reservation for a large party?',
    answer: 'Large party reservations are made by emailing hi@littlewolfrestaurant.com to be guided through the process.'
  },
  {
    id: 'faq-4',
    question: 'How can I find out more about events coming from Little Wolf?',
    answer: `Our Instagram is very active with loads more content from us!\n\nCheck us out @here!`
  }
];

export default function FAQAccordion() {
  return (
    <Accordion.Root type="single" collapsible className="faq-accordion">
      {faqs.map((faq) => (
        <Accordion.Item key={faq.id} value={faq.id} className="faq-item">
          <Accordion.Header>
            <Accordion.Trigger className="faq-trigger">
              <span>{faq.question}</span>
              <svg
                className="faq-chevron"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="faq-content">
            <div className="faq-content-inner">
              {faq.answer.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
