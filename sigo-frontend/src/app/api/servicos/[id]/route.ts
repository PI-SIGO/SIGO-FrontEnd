import { forwardToBackend } from "../../helpers";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  const { id } = await params;
  return forwardToBackend(`servicos/${id}`);
}

export async function PUT(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const body = await request.json();
  return forwardToBackend(`servicos/${id}`, {
    method: "PUT",
    body,
  });
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const { id } = await params;
  return forwardToBackend(`servicos/${id}`, {
    method: "DELETE",
  });
}
