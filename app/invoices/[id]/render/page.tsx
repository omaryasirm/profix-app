import RenderPage from "@/app/_pages/RenderPage";

interface Props {
  params: { id: string };
}

const RenderInvoicePage = ({ params }: Props) => {
  return <RenderPage params={params} display={true} />;
};

export default RenderInvoicePage;
