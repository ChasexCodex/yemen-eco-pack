type ErrorLike = {
  code?: string;
  message?: string;
};

export function isDbUnavailableError(error: unknown) {
  const maybe = error as ErrorLike | null | undefined;
  const code = maybe?.code;
  const message = (maybe?.message ?? "").toLowerCase();

  if (
    code === "ENOTFOUND" ||
    code === "ECONNREFUSED" ||
    code === "ECONNRESET" ||
    code === "ETIMEDOUT" ||
    code === "EAI_AGAIN" ||
    code === "ERR_INVALID_URL"
  ) {
    return true;
  }

  if (
    code === "XX000" &&
    (message.includes("tenant/user") ||
      message.includes("tenant identifier") ||
      message.includes("enotfound"))
  ) {
    return true;
  }

  return false;
}

