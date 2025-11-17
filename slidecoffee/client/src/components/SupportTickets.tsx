import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Clock, XCircle, MessageSquare, User } from "lucide-react";

type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
type TicketPriority = "low" | "medium" | "high" | "urgent";

const statusConfig = {
  open: { label: "Open", icon: AlertCircle, color: "bg-blue-500" },
  in_progress: { label: "In Progress", icon: Clock, color: "bg-yellow-500" },
  resolved: { label: "Resolved", icon: CheckCircle2, color: "bg-green-500" },
  closed: { label: "Closed", icon: XCircle, color: "bg-gray-500" },
};

const priorityConfig = {
  low: { label: "Low", color: "bg-gray-500" },
  medium: { label: "Medium", color: "bg-blue-500" },
  high: { label: "High", color: "bg-orange-500" },
  urgent: { label: "Urgent", color: "bg-red-500" },
};

export function SupportTickets() {
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "all">("all");
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);

  const utils = trpc.useUtils();

  // Fetch tickets with filters
  const { data: ticketsData, isLoading } = trpc.support.list.useQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
    priority: priorityFilter === "all" ? undefined : priorityFilter,
    limit: 50,
    offset: 0,
  });

  // Fetch stats
  const { data: stats } = trpc.support.getStats.useQuery();

  // Fetch selected ticket details
  const { data: ticketDetails } = trpc.support.get.useQuery(
    { ticketId: selectedTicketId! },
    { enabled: selectedTicketId !== null }
  );

  // Mutations
  const updateStatusMutation = trpc.support.updateStatus.useMutation({
    onSuccess: () => {
      utils.support.list.invalidate();
      utils.support.get.invalidate();
      utils.support.getStats.invalidate();
      toast.success("Ticket status updated");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const assignMutation = trpc.support.assign.useMutation({
    onSuccess: () => {
      utils.support.list.invalidate();
      utils.support.get.invalidate();
      toast.success("Ticket assigned");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const addResponseMutation = trpc.support.addResponse.useMutation({
    onSuccess: () => {
      utils.support.get.invalidate();
      utils.support.list.invalidate();
      setResponseMessage("");
      setIsInternalNote(false);
      toast.success("Response added");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleStatusChange = (ticketId: number, status: TicketStatus) => {
    updateStatusMutation.mutate({ ticketId, status });
  };

  const handleAddResponse = () => {
    if (!selectedTicketId || !responseMessage.trim()) return;
    addResponseMutation.mutate({
      ticketId: selectedTicketId,
      message: responseMessage,
      isInternal: isInternalNote,
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Open</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.open}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Urgent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Unassigned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.unassigned}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
          <CardDescription>Manage customer support requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tickets List */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading tickets...</div>
          ) : !ticketsData?.tickets.length ? (
            <div className="text-center py-8 text-muted-foreground">No tickets found</div>
          ) : (
            <div className="space-y-3">
              {ticketsData.tickets.map((ticket) => {
                const StatusIcon = statusConfig[ticket.status as keyof typeof statusConfig].icon;
                return (
                  <div
                    key={ticket.id}
                    className="border rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => setSelectedTicketId(ticket.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">#{ticket.id}</span>
                          <Badge variant="outline" className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig[ticket.status as keyof typeof statusConfig].label}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`${priorityConfig[ticket.priority as keyof typeof priorityConfig].color} text-white border-0`}
                          >
                            {priorityConfig[ticket.priority as keyof typeof priorityConfig].label}
                          </Badge>
                          {ticket.category && (
                            <Badge variant="secondary">{ticket.category}</Badge>
                          )}
                        </div>
                        <h4 className="font-semibold truncate">{ticket.subject}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {ticket.description}
                        </p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground whitespace-nowrap">
                        <div>{new Date(ticket.createdAt).toLocaleDateString()}</div>
                        {ticket.assignedTo && (
                          <div className="flex items-center gap-1 mt-1">
                            <User className="h-3 w-3" />
                            <span>Assigned</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Detail Dialog */}
      <Dialog open={selectedTicketId !== null} onOpenChange={() => setSelectedTicketId(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>Ticket #{selectedTicketId}</span>
              {ticketDetails && (
                <>
                  <Badge variant="outline" className="gap-1">
                    {React.createElement(statusConfig[ticketDetails.ticket.status as keyof typeof statusConfig].icon, {
                      className: "h-3 w-3",
                    })}
                    {statusConfig[ticketDetails.ticket.status as keyof typeof statusConfig].label}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`${priorityConfig[ticketDetails.ticket.priority as keyof typeof priorityConfig].color} text-white border-0`}
                  >
                    {priorityConfig[ticketDetails.ticket.priority as keyof typeof priorityConfig].label}
                  </Badge>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {ticketDetails && new Date(ticketDetails.ticket.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          {ticketDetails && (
            <div className="space-y-4">
              {/* Ticket Info */}
              <div>
                <h4 className="font-semibold mb-2">{ticketDetails.ticket.subject}</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {ticketDetails.ticket.description}
                </p>
              </div>

              {/* Admin Controls */}
              <div className="flex gap-2">
                <Select
                  value={ticketDetails.ticket.status}
                  onValueChange={(v) => handleStatusChange(ticketDetails.ticket.id, v as TicketStatus)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Responses */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Responses ({ticketDetails.responses.length})
                </h4>
                <div className="space-y-3 mb-4">
                  {ticketDetails.responses.map((response) => (
                    <div
                      key={response.id}
                      className={`p-3 rounded-lg ${
                        response.isInternal ? "bg-yellow-50 border border-yellow-200" : "bg-accent"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          User #{response.userId}
                          {response.isInternal && (
                            <Badge variant="outline" className="ml-2 bg-yellow-100">
                              Internal Note
                            </Badge>
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(response.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{response.message}</p>
                    </div>
                  ))}
                </div>

                {/* Add Response */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Type your response..."
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    rows={4}
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={isInternalNote}
                        onChange={(e) => setIsInternalNote(e.target.checked)}
                        className="rounded"
                      />
                      Internal note (not visible to user)
                    </label>
                    <Button
                      onClick={handleAddResponse}
                      disabled={!responseMessage.trim() || addResponseMutation.isPending}
                    >
                      {addResponseMutation.isPending ? "Sending..." : "Send Response"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

