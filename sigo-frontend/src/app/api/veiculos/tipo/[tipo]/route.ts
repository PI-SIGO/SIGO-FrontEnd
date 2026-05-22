import { forwardToBackend } from "../../../helpers";

type RouteContext = {
  params: Promise<{ tipo: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  const { tipo } = await params;
  return forwardToBackend(`veiculos/tipo/${tipo}`);
}
