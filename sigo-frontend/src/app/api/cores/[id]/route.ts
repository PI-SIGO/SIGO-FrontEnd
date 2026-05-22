import { forwardToBackend } from "../../helpers";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const body = await request.json();
  return forwardToBackend(`cores/${id}`, {
    method: "PUT",
    body,
  });
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const { id } = await params;
  return forwardToBackend(`cores/${id}`, {
    method: "DELETE",
  });
}
