/**
 * Domain error classes for the Google Workspace plugin.
 * Mirrors the error hierarchy from the Calendar plugin, generalized for all services.
 */

export class PluginConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PluginConfigurationError";
  }
}

export class AuthenticationRequiredError extends Error {
  public readonly authUrl?: string;

  constructor(message: string, authUrl?: string) {
    super(message);
    this.name = "AuthenticationRequiredError";
    this.authUrl = authUrl;
  }
}

export class ReadOnlyModeError extends Error {
  public readonly service: string;

  constructor(service: string, action: string) {
    super(
      `Cannot ${action}: ${service} is configured in read-only mode. ` +
        `Set services.${service}.readOnly to false in the plugin config to enable write operations.`,
    );
    this.name = "ReadOnlyModeError";
    this.service = service;
  }
}

export class ServiceNotEnabledError extends Error {
  public readonly service: string;

  constructor(service: string) {
    super(
      `The ${service} service is not enabled. ` +
        `Set services.${service}.enabled to true in the plugin config.`,
    );
    this.name = "ServiceNotEnabledError";
    this.service = service;
  }
}

export class ExternalServiceError extends Error {
  public readonly statusCode?: number;
  public readonly service: string;

  constructor(service: string, message: string, statusCode?: number) {
    super(message);
    this.name = "ExternalServiceError";
    this.service = service;
    this.statusCode = statusCode;
  }
}

export class ResourceNotFoundError extends Error {
  public readonly resource: string;

  constructor(resource: string, identifier: string) {
    super(`${resource} not found: ${identifier}`);
    this.name = "ResourceNotFoundError";
    this.resource = resource;
  }
}

export class ValidationError extends Error {
  public readonly field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}
