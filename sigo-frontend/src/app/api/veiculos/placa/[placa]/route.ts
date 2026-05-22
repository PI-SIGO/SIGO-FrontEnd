import { forwardToBackend } from "../../../helpers";

type RouteContext = {
  params: Promise<{ placa: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  const { placa } = await params;
  return forwardToBackend(`veiculos/placa/${placa}`);
}
