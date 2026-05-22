import { forwardToBackend } from "../../../helpers";

type RouteContext = {
  params: Promise<{ nome: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  const { nome } = await params;
  return forwardToBackend(`servicos/nome/${nome}`);
}
