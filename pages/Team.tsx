import React, { useEffect, useState, useMemo, Fragment } from "react";
import { Sidebar } from "../components/Sidebar";
import { useCurrentUser } from "app";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import { Button } from "../components/Button";
import { useTeamStore } from "../utils/teamStore";
import { TeamMember } from "../utils/types";
import {
  CrudMode,
  useCrudManager
} from "../utils/crudManager";
import { validateRequired, validateEmail } from "../utils/validation";
import { Dialog, ConfirmDialog } from "../components/Dialog";
import { FormField } from "../components/FormField";
import { useToast } from "../utils/AppProvider";
import { AppProvider } from "../utils/AppProvider";

function TeamContent() {
  const { user, loading: authLoading } = useCurrentUser();
  const navigate = useNavigate();
  const {
    teamMembers,
    teamPerformance,
    isLoading: teamLoading,
    error,
    fetchTeamMembers,
    fetchTeamPerformance,
    getTeamMembersByRole,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember
  } = useTeamStore();

  // Toast notifications
  const { showToast } = useToast();

  const [selectedDepartment, setSelectedDepartment] = useState<string>("All");
  const [currentYear] = useState<number>(new Date().getFullYear());
  const [currentQuarter] = useState<number>(Math.floor((new Date().getMonth() / 3) + 1));

  // Default empty team member for new records
  const defaultTeamMember: TeamMember = {
    id: '',
    name: '',
    role: '',
    position: '',
    email: '',
    phone: '',
    department: '',
    joined_date: new Date().toISOString().split('T')[0],
    status: 'Active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Validate team member form
  const validateTeamMember = (values: TeamMember) => {
    const errors: Record<string, string> = validateRequired(values, [
      'name', 'department', 'role', 'email'
    ]);

    // Email validation
    if (values.email && !errors.email) {
      const emailError = validateEmail(values.email);
      if (emailError) errors.email = emailError;
    }

    return errors;
  };

  // CRUD Manager for team members
  const teamCrud = useCrudManager<TeamMember>({
    entityName: 'Team Member',
    defaultEntity: defaultTeamMember,
    fetchEntities: fetchTeamMembers,
    createEntity: createTeamMember,
    updateEntity: updateTeamMember,
    deleteEntity: deleteTeamMember,
    validateEntity: validateTeamMember,
    onCreateSuccess: () => showToast('Team member added successfully', 'success'),
    onUpdateSuccess: () => showToast('Team member updated successfully', 'success'),
    onDeleteSuccess: () => showToast('Team member removed successfully', 'success'),
    onError: (error) => showToast(error.message, 'error')
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // Fetch team data on component mount
  useEffect(() => {
    if (user) {
      fetchTeamMembers();
      fetchTeamPerformance(currentYear, currentQuarter);
    }
  }, [user, fetchTeamMembers, fetchTeamPerformance, currentYear, currentQuarter]);

  // Filter team members by department
  const filteredTeamMembers = useMemo(() => {
    if (selectedDepartment === "All") {
      return teamMembers;
    }
    return teamMembers.filter(member => member.department === selectedDepartment);
  }, [teamMembers, selectedDepartment]);

  // Get unique departments for filter buttons
  const departments = useMemo(() => {
    const depts = new Set(teamMembers.map(member => member.department));
    return ["All", ...Array.from(depts)];
  }, [teamMembers]);

  // Calculate department performance metrics
  const departmentMetrics = useMemo(() => {
    return departments
      .filter(d => d !== "All")
      .map((dept) => {
        const deptMembers = teamMembers.filter(m => m.department === dept);
        // Use team_member_id for performance tracking
        const deptPerformance = teamPerformance.filter(p => {
          const member = teamMembers.find(m => m.id === p.team_member_id);
          return member?.department === dept;
        });

        // Calculate aggregate metrics
        const memberCount = deptMembers.length;
        const totalGoal = deptPerformance.reduce((sum, p) => sum + p.quota, 0);
        const totalForecast = deptPerformance.reduce((sum, p) => sum + p.forecast_amount, 0);
        const totalActual = deptPerformance.reduce((sum, p) => sum + (p.percent_to_goal * p.quota / 100), 0);
        const percentToGoal = totalGoal > 0 ? (totalActual / totalGoal * 100).toFixed(1) : "-";

        return {
          department: dept,
          memberCount,
          totalGoal,
          totalForecast,
          totalActual,
          percentToGoal
        };
      });
  }, [departments, teamMembers, teamPerformance]);

  if (authLoading || teamLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">Error loading team data: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Team</h1>
            <Button onClick={() => {
              console.log('Add Team Member button clicked!');
              teamCrud.createNew();
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
              </svg>
              Add Team Member
            </Button>
          </div>

          {/* Department Filters */}
          <div className="flex space-x-2 mb-6 flex-wrap gap-2">
            {departments.map((dept, index) => (
              <Button
                key={`dept-filter-${dept}-${index}`}
                variant={selectedDepartment === dept ? "secondary" : "outline"}
                className={selectedDepartment === dept ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
                onClick={() => setSelectedDepartment(dept)}
              >
                {dept}
              </Button>
            ))}
          </div>

          {/* Team Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {filteredTeamMembers.map((member, memberIndex) => (
              <Card key={`team-member-card-${member.id}-${memberIndex}`} className="overflow-hidden flex flex-col" style={{ minHeight: "430px" }}>
                <div className="p-6 flex items-start" key={`team-member-header-${member.id}-${memberIndex}`}>
                  <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-lg flex-shrink-0" key={`team-member-avatar-${member.id}-${memberIndex}`}>
                    {member.avatar_url ? (
                      <img
                        src={member.avatar_url}
                        alt={member.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="ml-4" key={`team-member-info-${member.id}-${memberIndex}`}>
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.position}</p>
                    <p className="text-sm text-gray-500 mt-1">{member.email}</p>
                  </div>
                </div>
                <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 flex-grow" key={`team-member-details-${member.id}-${memberIndex}`}>
                  <div className="grid grid-cols-2 gap-4 text-sm" key={`team-member-grid-${member.id}-${memberIndex}`}>
                    <div key={`${member.id}-dept-${memberIndex}`}>
                      <p className="text-gray-500">Department</p>
                      <p className="font-medium text-gray-900">{member.department}</p>
                    </div>
                    <div key={`${member.id}-joined-${memberIndex}`}>
                      <p className="text-gray-500">Joined</p>
                      <p className="font-medium text-gray-900">{new Date(member.joined_date || '').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</p>
                    </div>
                    {member.department === "Sales" && (
                      <Fragment key={`${member.id}-sales-info-${memberIndex}`}>
                        <div key={`${member.id}-role-${memberIndex}`}>
                          <p className="text-gray-500">Role</p>
                          <p className="font-medium text-gray-900">{member.role}</p>
                        </div>
                        <div key={`${member.id}-status-${memberIndex}`}>
                          <p className="text-gray-500">Status</p>
                          <p className="font-medium text-gray-900">{member.status}</p>
                        </div>
                      </Fragment>
                    )}
                  </div>
                </div>
                <div className="border-t border-gray-100 px-6 py-3 flex justify-end mt-auto" key={`team-member-footer-${member.id}-${memberIndex}`}>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      teamCrud.edit(member);
                    }}
                  >
                    View Profile
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Team Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Team Performance - Q{currentQuarter} {currentYear}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Department</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Members</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Goal</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Forecast</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Actual</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">% to Goal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentMetrics.map((metrics, index) => (
                      <tr key={`dept-metrics-${metrics.department}-${index}`} className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">{metrics.department}</td>
                        <td className="py-3 px-4">{metrics.memberCount}</td>
                        <td className="py-3 px-4">${(metrics.totalGoal).toLocaleString()}</td>
                        <td className="py-3 px-4">${(metrics.totalForecast).toLocaleString()}</td>
                        <td className="py-3 px-4">${(metrics.totalActual).toLocaleString()}</td>
                        <td className="py-3 px-4">{metrics.percentToGoal}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Member CRUD Dialogs */}
        <TeamFormDialogs teamCrud={teamCrud} />
      </div>
    </div>
  );
}

export default function Team() {
  return (
    <AppProvider>
      <TeamContent />
    </AppProvider>
  );
}

// Form dialogs for team member CRUD operations
function TeamFormDialogs({ teamCrud }: { teamCrud: any }) {
  // Department options
  const departmentOptions = [
    { value: 'Sales', label: 'Sales', id: 'dept-sales' },
    { value: 'Marketing', label: 'Marketing', id: 'dept-marketing' },
    { value: 'Customer Success', label: 'Customer Success', id: 'dept-cs' },
    { value: 'Product', label: 'Product', id: 'dept-product' },
    { value: 'Engineering', label: 'Engineering', id: 'dept-engineering' },
    { value: 'Finance', label: 'Finance', id: 'dept-finance' },
    { value: 'HR', label: 'HR', id: 'dept-hr' },
    { value: 'Operations', label: 'Operations', id: 'dept-operations' },
  ];

  // Role options
  const roleOptions = [
    { value: 'Account Executive', label: 'Account Executive', id: 'role-ae' },
    { value: 'Business Development Rep', label: 'Business Development Rep', id: 'role-bdr' },
    { value: 'Sales Manager', label: 'Sales Manager', id: 'role-sm' },
    { value: 'Marketing Specialist', label: 'Marketing Specialist', id: 'role-ms' },
    { value: 'Customer Success Manager', label: 'Customer Success Manager', id: 'role-csm' },
    { value: 'Product Manager', label: 'Product Manager', id: 'role-pm' },
    { value: 'Software Engineer', label: 'Software Engineer', id: 'role-se' },
    { value: 'Designer', label: 'Designer', id: 'role-designer' },
    { value: 'Data Analyst', label: 'Data Analyst', id: 'role-da' },
    { value: 'Operations Manager', label: 'Operations Manager', id: 'role-om' },
  ];

  // Status options
  const statusOptions = [
    { value: 'Active', label: 'Active', id: 'status-active' },
    { value: 'Inactive', label: 'Inactive', id: 'status-inactive' },
    { value: 'On Leave', label: 'On Leave', id: 'status-leave' },
  ];

  const isCreating = teamCrud.state.mode === CrudMode.CREATE;
  const isEditing = teamCrud.state.mode === CrudMode.UPDATE;
  const isDeleting = teamCrud.state.mode === CrudMode.DELETE;

  return (
    <>
      {/* Create/Edit Team Member Dialog */}
      <Dialog
        isOpen={teamCrud.state.isDialogOpen && (isCreating || isEditing)}
        onClose={teamCrud.closeDialog}
        title={teamCrud.getDialogTitle()}
        maxWidth="lg"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          teamCrud.handleSubmit();
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Full Name"
              name="name"
              value={teamCrud.form.values.name}
              onChange={teamCrud.form.handleChange}
              onBlur={teamCrud.form.handleBlur}
              error={teamCrud.form.touched.name ? teamCrud.form.errors.name : ''}
              required
            />

            <FormField
              label="Email"
              name="email"
              type="email"
              value={teamCrud.form.values.email}
              onChange={teamCrud.form.handleChange}
              onBlur={teamCrud.form.handleBlur}
              error={teamCrud.form.touched.email ? teamCrud.form.errors.email : ''}
              required
            />

            <FormField
              label="Department"
              name="department"
              type="select"
              value={teamCrud.form.values.department}
              onChange={teamCrud.form.handleChange}
              onBlur={teamCrud.form.handleBlur}
              error={teamCrud.form.touched.department ? teamCrud.form.errors.department : ''}
              selectOptions={departmentOptions}
              required
            />

            <FormField
              label="Role"
              name="role"
              type="select"
              value={teamCrud.form.values.role}
              onChange={teamCrud.form.handleChange}
              onBlur={teamCrud.form.handleBlur}
              error={teamCrud.form.touched.role ? teamCrud.form.errors.role : ''}
              selectOptions={roleOptions}
              required
            />

            <FormField
              label="Position"
              name="position"
              value={teamCrud.form.values.position}
              onChange={teamCrud.form.handleChange}
            />

            <FormField
              label="Phone"
              name="phone"
              type="tel"
              value={teamCrud.form.values.phone}
              onChange={teamCrud.form.handleChange}
            />

            <FormField
              label="Status"
              name="status"
              type="select"
              value={teamCrud.form.values.status}
              onChange={teamCrud.form.handleChange}
              selectOptions={statusOptions}
            />

            <FormField
              label="Join Date"
              name="joined_date"
              type="date"
              value={teamCrud.form.values.joined_date ? teamCrud.form.values.joined_date.split('T')[0] : ''}
              onChange={teamCrud.form.handleChange}
            />

            <FormField
              label="Avatar URL"
              name="avatar_url"
              value={teamCrud.form.values.avatar_url || ''}
              onChange={teamCrud.form.handleChange}
              className="col-span-2"
            />
          </div>

          <div className="mt-6 flex justify-between space-x-3">
            {isEditing && (
              <Button
                variant="destructive"
                type="button"
                onClick={() => {
                  // Ensure we have a valid entity with an ID before triggering delete
                  if (teamCrud.state.currentEntity && teamCrud.state.currentEntity.id) {
                    teamCrud.closeDialog();
                    setTimeout(() => teamCrud.confirmDelete(teamCrud.state.currentEntity), 200);
                  } else {
                    console.error('Cannot delete team member: Invalid entity or missing ID');
                  }
                }}
              >
                Delete
              </Button>
            )}
            <div className="ml-auto flex space-x-3">
              <Button
                variant="outline"
                onClick={teamCrud.closeDialog}
                type="button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={teamCrud.state.isLoading}
              >
                {teamCrud.state.isLoading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={teamCrud.state.isDialogOpen && isDeleting}
        onClose={teamCrud.closeDialog}
        onConfirm={teamCrud.handleSubmit}
        title="Remove Team Member"
        message={
          `Are you sure you want to remove ${teamCrud.state.currentEntity?.name} from the team? 
          This action cannot be undone.`
        }
        confirmText="Remove"
        confirmVariant="destructive"
      />
    </>
  );
}
