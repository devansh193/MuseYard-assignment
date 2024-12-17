import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ParsedMessage {
  timestamp?: string;
  sender?: string;
  content?: string;
  data?: string[];
}

interface ParsedResultsProps {
  data: {
    "Links/URLs": ParsedMessage[];
    "Quotes/Insights": ParsedMessage[];
    "Personal Notes": ParsedMessage[];
    "Reading Lists": ParsedMessage[];
  };
}

export default function ParsedResults({ data }: ParsedResultsProps) {
  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Parsed Chat Results</h3>
      <Accordion type="single" collapsible className="w-full">
        {Object.entries(data).map(([category, items]) => (
          <AccordionItem value={category} key={category}>
            <AccordionTrigger>
              {category} ({items.length})
            </AccordionTrigger>
            <AccordionContent>
              <ScrollArea className="h-[450px] w-full rounded-md border p-4">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="mb-2 pb-2 border-b last:border-b-0"
                  >
                    {item.timestamp && (
                      <p className="text-sm text-gray-500">{item.timestamp}</p>
                    )}
                    {item.sender && (
                      <p className="font-semibold">{item.sender}</p>
                    )}

                    {category === "Links/URLs" && item.data?.[0] && (
                      <a
                        href={item.data[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {item.data[0]}
                      </a>
                    )}
                    {category === "Quotes/Insights" && item.data?.[0] && (
                      <p className="italic">{item.data[0]}</p>
                    )}
                    {category === "Reading Lists" && item.data?.[0] && (
                      <p>{item.data[0]}</p>
                    )}
                    {category === "Personal Notes" && item.content && (
                      <p>{item.content}</p>
                    )}
                  </div>
                ))}
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
